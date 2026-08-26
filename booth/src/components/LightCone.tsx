// A soft cone of light falling from above, built from layered gradients.
// Positioned by the fraction of the container width its source sits at.

export default function LightCone({
  x,
  spread = 0.34,
  intensity = 0.5,
  hue = "cool",
  tilt = 0,
}: {
  x: number; // 0..1 across the container
  spread?: number; // width of the pool as a fraction of container width
  intensity?: number; // 0..1
  hue?: "cool" | "warm" | "blue";
  tilt?: number; // degrees, positive leans right
}) {
  const colors = {
    cool: "237, 234, 226",
    warm: "217, 164, 65",
    blue: "46, 155, 214",
  }[hue];
  const half = (spread * 100) / 2;
  const cx = x * 100;
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        transform: `rotate(${tilt}deg)`,
        transformOrigin: `${cx}% -10%`,
      }}
    >
      {/* the beam */}
      <div
        style={{
          position: "absolute",
          top: "-22%",
          bottom: "-6%",
          left: `${cx - half}%`,
          width: `${half * 2}%`,
          background: `linear-gradient(to bottom, rgba(${colors}, ${0.28 * intensity}) 0%, rgba(${colors}, ${0.11 * intensity}) 45%, rgba(${colors}, 0) 92%)`,
          clipPath: "polygon(40% 0%, 60% 0%, 108% 100%, -8% 100%)",
          filter: "blur(30px)",
          mixBlendMode: "screen",
          maskImage:
            "linear-gradient(to right, transparent 0%, black 22%, black 78%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 22%, black 78%, transparent 100%)",
        }}
      />
      {/* hot core near the source */}
      <div
        style={{
          position: "absolute",
          top: "-14%",
          height: "44%",
          left: `${cx - half * 0.5}%`,
          width: `${half}%`,
          background: `radial-gradient(50% 60% at 50% 12%, rgba(${colors}, ${0.5 * intensity}) 0%, rgba(${colors}, 0) 70%)`,
          filter: "blur(10px)",
          mixBlendMode: "screen",
        }}
      />
      {/* pool on the floor */}
      <div
        style={{
          position: "absolute",
          bottom: "-6%",
          height: "26%",
          left: `${cx - half * 1.3}%`,
          width: `${half * 2.6}%`,
          background: `radial-gradient(50% 55% at 50% 60%, rgba(${colors}, ${0.20 * intensity}) 0%, rgba(${colors}, 0) 72%)`,
          filter: "blur(14px)",
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
}
