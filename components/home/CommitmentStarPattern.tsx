/** Gold star texture behind Cavender Commitment copy (see public/stars-texture.png). */
export function CommitmentStarPattern() {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage: "url('/stars-texture.png')",
        opacity: 0.08,
        backgroundSize: "400px",
        backgroundRepeat: "repeat",
      }}
      aria-hidden
    />
  );
}
