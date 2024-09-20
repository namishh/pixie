import { useEffect } from "react";
import { useEditorStore, useImageStore } from "@/store/store";

import { CropHandlers } from "./CropHandler";

export const Canvas = ({
  LoadImage,
  ResizeCanvas,
}: {
  LoadImage: (img: string | File | null) => void;
  ResizeCanvas: (autofit: boolean) => void;
}) => {
  const { zoomRatio, showCanvasBorder } = useEditorStore();
  const { imgBuff } = useImageStore();

  useEffect(() => {
    console.log("Redrawing Canvas");
    ResizeCanvas(false);
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (!imgBuff) return;
    ctx.drawImage(imgBuff, 0, 0);
  }, [zoomRatio]);

  useEffect(() => {
    LoadImage(null);
  }, []);

  return (
    <div
      id="canvas-container"
      style={{ width: "100%", height: "100%", position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}
    >
      <canvas
        id="canvas"
        className={`${showCanvasBorder && "outline-4 outline outline-neutral-500"}`}
      ></canvas>
      
      <CropHandlers />
    </div>
  );
};
