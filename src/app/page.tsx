import Window from "@/components/window";

export default function Home() {
  return (
    <div style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
      <video
        src="/wallpaper.mp4"
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: -1,
        }}
      />
      <div style={{ position: "relative", zIndex: 0 }}>
        <Window />
      </div>
    </div>
  );
}
