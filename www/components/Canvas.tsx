import { useEffect } from "react";

export const Canvas = ({
  LoadImage,
}: {
  LoadImage: (img: string | File) => void;
}) => {
  useEffect(() => {
    LoadImage("/sample.jpg");
  }, []);
  return (
    <div
      id="canvas-container"
      style={{ width: "100%", height: "100%", position: "relative" }}
    >
      <canvas id="canvas" style={{ position: "absolute" }}></canvas>
      <div style={{ position: "absolute", top: 0, left: 0, color: "red" }}>
        Canvas Component
      </div>
    </div>
  );
};
