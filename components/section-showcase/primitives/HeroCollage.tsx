import { PlaceholderImage } from "./PlaceholderImage";

const TILE_CLASS = {
  a: "hero-collage-tile-a min-h-[11rem] sm:min-h-[12.5rem]",
  b: "hero-collage-tile-b",
  c: "hero-collage-tile-c min-h-[9rem] sm:min-h-[10rem]",
  d: "hero-collage-tile-d min-h-[8rem] sm:min-h-[9rem]",
} as const;

const POSITIONS = ["a", "b", "c", "d"] as const;

export function HeroCollage() {
  return (
    <div className="relative w-full lg:pl-1">
      <div className="hero-collage-grid min-h-[22rem] sm:min-h-[26rem] lg:min-h-[30rem] xl:min-h-[34rem]">
        {POSITIONS.map((pos) => (
          <div key={pos} className={`hero-collage-tile ${TILE_CLASS[pos]}`}>
            <PlaceholderImage label={`Collage ${pos.toUpperCase()}`} fill />
          </div>
        ))}
      </div>
    </div>
  );
}
