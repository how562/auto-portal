import type { DealershipLocation } from "@/lib/locationsPageTypes";

interface LocationsMapPanelProps {
  locations: DealershipLocation[];
}

export function LocationsMapPanel({ locations }: LocationsMapPanelProps) {
  const insetLocations = locations.filter((loc) => loc.showOnInset);

  return (
    <div className="locations-map-panel" role="img" aria-label="Dealership locations map">
      <div className="locations-map-panel__surface">
        <svg
          className="locations-map-panel__terrain"
          viewBox="0 0 400 280"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden
        >
          <defs>
            <linearGradient id="loc-map-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e8eef4" />
              <stop offset="100%" stopColor="#d4dce6" />
            </linearGradient>
          </defs>
          <rect width="400" height="280" fill="url(#loc-map-sky)" />
          <path
            d="M0 200 Q80 160 120 175 T200 165 T280 180 T400 155 L400 280 L0 280 Z"
            fill="#c5d4c8"
            opacity="0.55"
          />
          <path
            d="M40 120 Q120 90 180 110 T300 95 T380 115 L400 130 L400 0 L0 0 L0 140 Z"
            fill="#e2ebe0"
            opacity="0.7"
          />
          <path
            d="M60 140 L340 140"
            stroke="#b8c4b0"
            strokeWidth="2"
            strokeDasharray="6 8"
            opacity="0.6"
          />
          <path
            d="M120 60 L120 220 M220 50 L220 230"
            stroke="#c8d0c4"
            strokeWidth="1.5"
            opacity="0.5"
          />
          <text x="95" y="200" fill="#8a9488" fontSize="11" fontWeight="600">
            San Antonio
          </text>
          <text x="250" y="95" fill="#8a9488" fontSize="10" fontWeight="600">
            Hill Country
          </text>
        </svg>

        <ol className="locations-map-panel__legend">
          {locations.map((loc) => (
            <li key={loc.id}>
              <a href={`#location-${loc.id}`} className="locations-map-panel__legend-item">
                <span className="locations-map-panel__legend-num">{loc.number}</span>
                <span className="locations-map-panel__legend-name">{loc.storeName}</span>
              </a>
            </li>
          ))}
        </ol>

        <ul className="locations-map-panel__markers" aria-hidden>
          {locations
            .filter((loc) => !loc.showOnInset)
            .map((loc) => (
              <li
                key={loc.id}
                className="locations-map-panel__marker"
                style={{ top: loc.mapPosition.top, left: loc.mapPosition.left }}
              >
                <span>{loc.number}</span>
              </li>
            ))}
        </ul>

        {insetLocations.length > 0 ? (
          <div className="locations-map-panel__inset" aria-hidden>
            <svg viewBox="0 0 80 90" className="locations-map-panel__inset-svg">
              <path
                d="M40 8 L68 28 L72 58 L52 82 L28 78 L12 52 Z"
                fill="#d8dde3"
                stroke="#b0b8c0"
                strokeWidth="1"
              />
            </svg>
            {insetLocations.map((loc) => (
              <div key={loc.id} className="locations-map-panel__inset-label">
                <span className="locations-map-panel__inset-num">{loc.number}</span>
                <span>{loc.storeName.split(" ").slice(-1).join(" ") || loc.storeName}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
