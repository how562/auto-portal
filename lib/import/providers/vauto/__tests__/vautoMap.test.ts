/**
 * vAuto parser / mapping unit tests (node:test).
 * Run: npm run test:vauto
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  mapVautoRow,
  mapVautoRowsDetailed,
  parseVautoFeedFile,
} from "@/lib/import/providers/vauto";
import {
  fileMatchesDealerIdentifier,
  normalizeCondition,
  parseImageUrls,
  parseUsablePrice,
} from "@/lib/import/providers/vauto/vautoFieldUtils";
import { softDeactivateMissingProviderVins } from "@/lib/import/vehicleUpsert";
import {
  hasCanonicalStockKey,
  hasCanonicalUpsertKey,
  hasCanonicalVinKey,
  type CanonicalVehicleRow,
} from "@/lib/import/canonicalVehicle";
import { isImportAuthorized } from "@/lib/import/importAuth";

const STORE_ID = "11111111-1111-4111-8111-111111111111";

const VAUTO_HEADERS = [
  "DealerId",
  "Dealer Name",
  "VIN",
  "Stock #",
  "New/Used",
  "Year",
  "Make",
  "Model",
  "Series",
  "Body",
  "Odometer",
  "Colour",
  "Interior Color",
  "MSRP",
  "Price",
  "Photo Url List",
  "Disposition",
].join(",");

function vautoCsvRow(fields: Record<string, string>): string {
  const order = [
    "DealerId",
    "Dealer Name",
    "VIN",
    "Stock #",
    "New/Used",
    "Year",
    "Make",
    "Model",
    "Series",
    "Body",
    "Odometer",
    "Colour",
    "Interior Color",
    "MSRP",
    "Price",
    "Photo Url List",
    "Disposition",
  ];
  return order
    .map((key) => {
      const value = fields[key] ?? "";
      if (/[",\n\r]/.test(value)) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    })
    .join(",");
}

function sampleCanonical(
  overrides: Partial<CanonicalVehicleRow> = {},
): CanonicalVehicleRow {
  const now = new Date().toISOString();
  return {
    import_key: "vin|stock",
    vin: "1G1YY22G965100001",
    stock_number: "B100",
    store_id: STORE_ID,
    dealer_name: "Test",
    year: 2024,
    make: "Buick",
    model: "Enclave",
    trim: null,
    condition: "new",
    body_style: null,
    exterior_color: null,
    interior_color: null,
    mileage: 10,
    internet_price: 40000,
    msrp: 45000,
    sale_price: null,
    primary_image_url: null,
    image_urls: null,
    image_count: 0,
    has_images: false,
    data_quality_score: 0,
    status: "active",
    source_raw: {},
    import_source: "vauto",
    inventory_provider: "vauto",
    imported_at: now,
    last_seen_at: now,
    ...overrides,
  };
}

describe("vAuto parse + map", () => {
  it("parses CSV and maps flexible / real vAuto headers", () => {
    const csv = [
      VAUTO_HEADERS,
      vautoCsvRow({
        DealerId: "CavenderBuickGMCNorth",
        "Dealer Name": "Cavender Buick GMC North",
        VIN: "1GT49TEY5RF123456",
        "Stock #": "G1234",
        "New/Used": "N",
        Year: "2024",
        Make: "GMC",
        Model: "Sierra 1500",
        Series: "AT4",
        Colour: "Onyx Black",
        "Interior Color": "Jet Black",
        MSRP: "58990",
        Price: "",
        "Photo Url List":
          "https://cdn.example.com/1.jpg,https://cdn.example.com/2.jpg",
        Disposition: "R",
      }),
    ].join("\n");

    const parsed = parseVautoFeedFile(csv);
    assert.equal(parsed.rows.length, 1);

    const mapped = mapVautoRow(parsed.rows[0], { forcedStoreId: STORE_ID });
    assert.ok(mapped);
    assert.equal(mapped.vin, "1GT49TEY5RF123456");
    assert.equal(mapped.stock_number, "G1234");
    assert.equal(mapped.make, "GMC");
    assert.equal(mapped.model, "Sierra 1500");
    assert.equal(mapped.trim, "AT4");
    assert.equal(mapped.condition, "new");
    assert.equal(mapped.exterior_color, "Onyx Black");
    assert.equal(mapped.msrp, 58990);
    assert.equal(mapped.internet_price, null);
    assert.equal(mapped.inventory_provider, "vauto");
    assert.equal(mapped.import_source, "vauto");
    assert.deepEqual(mapped.image_urls, [
      "https://cdn.example.com/1.jpg",
      "https://cdn.example.com/2.jpg",
    ]);
    assert.equal(mapped.primary_image_url, "https://cdn.example.com/1.jpg");
    assert.equal(mapped.store_id, STORE_ID);
    assert.ok(mapped.last_seen_at);
  });

  it("skips rows missing VIN and stock", () => {
    const row = mapVautoRow(
      { Make: "Buick", Model: "Enclave" },
      { forcedStoreId: STORE_ID },
    );
    assert.equal(row, null);
  });

  it("skips rows missing make or model", () => {
    const row = mapVautoRow(
      { VIN: "1G1YY22G965100001", Make: "Buick" },
      { forcedStoreId: STORE_ID },
    );
    assert.equal(row, null);

    const detailed = mapVautoRowsDetailed(
      [
        { VIN: "1G1YY22G965100001", Make: "Buick" },
        { Make: "X", Model: "Y" },
      ],
      { forcedStoreId: STORE_ID },
    );
    assert.equal(detailed.skipCounts.missingMakeOrModel, 1);
    assert.equal(detailed.skipCounts.missingKey, 1);
  });

  it("allows stock-only rows when make+model present", () => {
    const row = mapVautoRow(
      {
        "Stock #": "STOCK1",
        Make: "Nissan",
        Model: "Rogue",
        Year: "2022",
      },
      { forcedStoreId: STORE_ID },
    );
    assert.ok(row);
    assert.equal(row.vin, null);
    assert.equal(row.stock_number, "STOCK1");
    assert.ok(hasCanonicalStockKey(row));
    assert.ok(hasCanonicalUpsertKey(row));
    assert.equal(hasCanonicalVinKey(row), false);
  });

  it("rejects XML and JSON feeds", () => {
    assert.throws(() => parseVautoFeedFile("<?xml version='1.0'?><cars/>"), /XML/);
    assert.throws(() => parseVautoFeedFile('{"vehicles":[]}'), /JSON/);
  });

  it("orders image URLs and drops non-http values", () => {
    assert.deepEqual(
      parseImageUrls(
        "javascript:alert(1)|https://cdn.example.com/a.jpg;https://cdn.example.com/b.jpg",
      ),
      ["https://cdn.example.com/a.jpg", "https://cdn.example.com/b.jpg"],
    );
  });

  it("treats zero prices as missing", () => {
    assert.equal(parseUsablePrice("0"), null);
    assert.equal(parseUsablePrice("$12,500.00"), 12500);
  });

  it("normalizes condition aliases", () => {
    assert.equal(normalizeCondition("N"), "new");
    assert.equal(normalizeCondition("U"), "used");
    assert.equal(normalizeCondition("Certified"), "cpo");
  });

  it("matches dealer tokens in filenames", () => {
    assert.equal(
      fileMatchesDealerIdentifier("inventory-bgmcn-2026.csv", "BGMCN"),
      true,
    );
    assert.equal(
      fileMatchesDealerIdentifier("cavender_buick.csv", "BGMCN"),
      false,
    );
  });

  it("keeps duplicate VIN last-wins identity helpers intact", () => {
    const a = sampleCanonical({ vin: "VIN1", stock_number: "A" });
    const b = sampleCanonical({ vin: "VIN1", stock_number: "B" });
    assert.ok(hasCanonicalVinKey(a));
    assert.ok(hasCanonicalVinKey(b));
    assert.equal(a.vin, b.vin);
  });
});

describe("import auth", () => {
  it("rejects unauthorized requests when secrets are unset or mismatched", () => {
    const prevImport = process.env.IMPORT_SECRET;
    const prevCron = process.env.IMPORT_CRON_SECRET;
    const prevCron2 = process.env.CRON_SECRET;
    try {
      delete process.env.IMPORT_SECRET;
      delete process.env.IMPORT_CRON_SECRET;
      delete process.env.CRON_SECRET;
      const req = new Request("http://localhost/api/import-vauto?secret=x");
      assert.equal(isImportAuthorized(req), false);

      process.env.IMPORT_SECRET = "correct-secret";
      assert.equal(
        isImportAuthorized(
          new Request("http://localhost/api/import-vauto?secret=wrong"),
        ),
        false,
      );
      assert.equal(
        isImportAuthorized(
          new Request("http://localhost/api/import-vauto?secret=correct-secret"),
        ),
        true,
      );
      process.env.IMPORT_CRON_SECRET = "cron-secret";
      assert.equal(
        isImportAuthorized(
          new Request("http://localhost/api/import-vauto", {
            headers: { "x-cron-secret": "cron-secret" },
          }),
        ),
        true,
      );
    } finally {
      if (prevImport === undefined) delete process.env.IMPORT_SECRET;
      else process.env.IMPORT_SECRET = prevImport;
      if (prevCron === undefined) delete process.env.IMPORT_CRON_SECRET;
      else process.env.IMPORT_CRON_SECRET = prevCron;
      if (prevCron2 === undefined) delete process.env.CRON_SECRET;
      else process.env.CRON_SECRET = prevCron2;
    }
  });
});

describe("reconcile behavior (documented stock-only rule)", () => {
  it("exports softDeactivateMissingProviderVins for VIN-only reconcile", () => {
    assert.equal(typeof softDeactivateMissingProviderVins, "function");
  });
});
