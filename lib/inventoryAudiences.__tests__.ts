/**
 * JLR inventory audience unit tests (node:test).
 * Run: npm run test:vauto (includes this file)
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canonicalVehiclePath,
  isJaguarMake,
  isLandRoverFamilyMake,
  isSharedPreownedCondition,
  normalizeMakeToken,
  vehicleDetailPathWithAudience,
  vehicleMatchesAudience,
  vehicleMatchesAnyJlrAudience,
} from "@/lib/inventoryAudienceRules";

describe("make normalization", () => {
  it("normalizes Jaguar / Land Rover / Range Rover variants", () => {
    assert.equal(normalizeMakeToken("Jaguar"), "jaguar");
    assert.equal(normalizeMakeToken("Land Rover"), "landrover");
    assert.equal(normalizeMakeToken("LAND ROVER"), "landrover");
    assert.equal(normalizeMakeToken("LandRover"), "landrover");
    assert.equal(normalizeMakeToken("Range Rover"), "rangerover");
    assert.ok(isJaguarMake("Jaguar"));
    assert.ok(isLandRoverFamilyMake("Land Rover"));
    assert.ok(isLandRoverFamilyMake("LAND ROVER"));
    assert.ok(isLandRoverFamilyMake("LandRover"));
    assert.ok(isLandRoverFamilyMake("Range Rover"));
  });

  it("uses model fallback only when make is blank", () => {
    assert.ok(isLandRoverFamilyMake("", "Range Rover Sport"));
    assert.equal(isLandRoverFamilyMake("Toyota", "Range Rover Sport"), false);
  });
});

describe("audience visibility", () => {
  const usedJag = { condition: "used", make: "Jaguar", model: "XF" };
  const usedLr = { condition: "used", make: "Land Rover", model: "Discovery" };
  const usedToyota = { condition: "used", make: "Toyota", model: "Camry" };
  const cpo = { condition: "cpo", make: "BMW", model: "X5" };
  const newJag = { condition: "new", make: "Jaguar", model: "F-PACE" };
  const newLr = { condition: "new", make: "Land Rover", model: "Defender" };
  const newRr = { condition: "new", make: "Range Rover", model: "Sport" };
  const newNonJlr = { condition: "new", make: "Ford", model: "F-150" };

  it("new Jaguar visible only to Jaguar", () => {
    assert.equal(vehicleMatchesAudience(newJag, "jaguar"), true);
    assert.equal(vehicleMatchesAudience(newJag, "land_rover"), false);
  });

  it("new Land Rover visible only to Land Rover", () => {
    assert.equal(vehicleMatchesAudience(newLr, "land_rover"), true);
    assert.equal(vehicleMatchesAudience(newLr, "jaguar"), false);
  });

  it("new Range Rover visible only to Land Rover", () => {
    assert.equal(vehicleMatchesAudience(newRr, "land_rover"), true);
    assert.equal(vehicleMatchesAudience(newRr, "jaguar"), false);
  });

  it("new non-JLR hidden from both", () => {
    assert.equal(vehicleMatchesAudience(newNonJlr, "jaguar"), false);
    assert.equal(vehicleMatchesAudience(newNonJlr, "land_rover"), false);
    assert.equal(vehicleMatchesAnyJlrAudience(newNonJlr), false);
  });

  it("used Jaguar / Land Rover / third-party visible to both", () => {
    for (const v of [usedJag, usedLr, usedToyota]) {
      assert.equal(vehicleMatchesAudience(v, "jaguar"), true);
      assert.equal(vehicleMatchesAudience(v, "land_rover"), true);
    }
  });

  it("CPO visible to both (shared preowned)", () => {
    assert.ok(isSharedPreownedCondition("cpo"));
    assert.equal(vehicleMatchesAudience(cpo, "jaguar"), true);
    assert.equal(vehicleMatchesAudience(cpo, "land_rover"), true);
  });

  it("invalid new-vehicle audience context is blocked by matcher", () => {
    assert.equal(vehicleMatchesAudience(newJag, "land_rover"), false);
    assert.equal(vehicleMatchesAudience(newLr, "jaguar"), false);
  });

  it("shared used vehicle keeps one identity (canonical path, no clone)", () => {
    const id = "shared-used-id";
    const vehicle = { id, ...usedToyota };
    assert.equal(canonicalVehiclePath(vehicle), `/inventory/${id}`);
    assert.equal(
      vehicleDetailPathWithAudience(id, "jaguar"),
      `/inventory/${id}?audience=jaguar`,
    );
    assert.equal(
      vehicleDetailPathWithAudience(id, "land_rover"),
      `/inventory/${id}?audience=land_rover`,
    );
  });

  it("new franchise vehicles use matching audience as canonical", () => {
    assert.equal(
      canonicalVehiclePath({ id: "j1", ...newJag }),
      "/inventory/j1?audience=jaguar",
    );
    assert.equal(
      canonicalVehiclePath({ id: "lr1", ...newLr }),
      "/inventory/lr1?audience=land_rover",
    );
    assert.equal(
      canonicalVehiclePath({ id: "rr1", ...newRr }),
      "/inventory/rr1?audience=land_rover",
    );
  });
});

describe("store isolation documentation fixtures", () => {
  it("does not classify used inventory by make", () => {
    // Used third-party must remain shared regardless of make.
    assert.equal(
      vehicleMatchesAudience(
        { condition: "used", make: "Honda", model: "Accord" },
        "jaguar",
      ),
      true,
    );
    assert.equal(
      vehicleMatchesAudience(
        { condition: "used", make: "Honda", model: "Accord" },
        "land_rover",
      ),
      true,
    );
  });
});
