"use client";

import { greet } from "../../pkg/foto";
import { editorStore } from "@/store/store";
import { Canvas } from "@/components/Canvas";

export default function Home() {
  const { imageUrl, imageObject, zoomRatio, setZoomRatio } = editorStore();

  function ResizeCanvas(autofit: Boolean) {
    let wasmimage = imageObject.getWASMImage();
    let width = wasmimage.width();
    let height = wasmimage.height();
    let canvas = document.getElementById("canvas") as HTMLCanvasElement;
    let container = document.getElementById(
      "canvas-container",
    ) as HTMLDivElement;

    let zoom = 1;

    let paddedHeight = height * 0.9;
    let paddedWidth = width * 0.9;

    let containerWidth = container.offsetWidth;
    let containerHeight = container.offsetHeight;

    if (autofit) {
      if (paddedWidth >= width && paddedHeight >= height) {
        zoom = 1.0;
      } else {
        zoom = Math.min(paddedWidth / width, paddedHeight / height);
      }
    }

    if (autofit) {
      setZoomRatio(zoom);
    }

    let newWidth = Math.round(width * zoomRatio);
    let newHeight = Math.round(height * zoomRatio);
    if (canvas.width !== newWidth || canvas.height !== newHeight) {
      canvas.width = newWidth;
      canvas.height = newHeight;
      let ctx = canvas.getContext("2d");
      if (!ctx) {
        return;
      }
      ctx.scale(zoomRatio, zoomRatio);
    }

    let left = Math.round(Math.max(0, containerWidth - newWidth) / 2);
    let top = Math.round(Math.max(0, containerHeight - newHeight) / 2);
    canvas.style.left = left + "px";
    canvas.style.top = top + "px";
  }

  function LoadImage(src: string | File) {
    if (!src) {
      return "/sample.jpg";
    }

    let srcType: "url" | "file" = "url";

    if (src instanceof File) {
      srcType = "file";
    }

    let img = new Image();

    if (srcType === "url") {
      img.src = src as string;
    } else {
      let reader = new FileReader();
      reader.readAsDataURL(src as File);
      reader.onload = (event) => {
        if (event.target) {
          img.src = event.target.result as string;
        }
      };
    }
  }

  greet();
  return (
    <div className="h-screen w-screen font-[family-name:var(--font-geist-sans)]">
      <Canvas />
    </div>
  );
}
