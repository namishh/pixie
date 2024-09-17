"use client";

import { greet } from "../../pkg/foto";
import { useEditorStore, useImageStore } from "@/store/store";
import { Canvas } from "@/components/Canvas";

export default function Home() {
  const { setImageSrc, zoomRatio, setZoomRatio } = useEditorStore();
  const imageObject = useImageStore();

  function ResizeCanvas(autofit: Boolean) {
    let wasmimage = imageObject.getWasmImg();
    let width = wasmimage.width();
    let height = wasmimage.height();
    let canvas = document.getElementById("canvas") as HTMLCanvasElement;
    let container = document.getElementById(
      "canvas-container",
    ) as HTMLDivElement;

    let zoom = 1;
    if (!autofit) {
      zoom = zoomRatio;
    }

    let containerWidth = container.offsetWidth;
    let containerHeight = container.offsetHeight;

    let paddedHeight = containerWidth * 0.9;
    let paddedWidth = containerHeight * 0.9;

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

    let newWidth = Math.round(width * zoom);
    let newHeight = Math.round(height * zoom);

    console.log(zoom);

    console.log(canvas.width, canvas.height);
    console.log(newWidth, newHeight);

    if (canvas.width !== newWidth || canvas.height !== newHeight) {
      console.log("Resizing canvas: ", newWidth, newHeight);
      canvas.width = newWidth;
      canvas.height = newHeight;
      let ctx = canvas.getContext("2d");
      if (!ctx) {
        return;
      }
      console.log(zoom);
      ctx.scale(zoom, zoom);
    }

    let left = Math.round(Math.max(0, containerWidth - newWidth) / 2);
    let top = Math.round(Math.max(0, containerHeight - newHeight) / 2);
    canvas.style.left = left + "px";
    canvas.style.top = top + "px";
  }

  function DrawImage(img: HTMLImageElement) {
    console.log("DrawImage called", img.naturalWidth, "x", img.naturalHeight);
    const w = img.naturalWidth;
    const h = img.naturalHeight;

    imageObject.setImgBuff(img);
    let wasmimage = imageObject.getWasmImg();

    let canvas = document.getElementById("canvas") as HTMLCanvasElement;
    if (!canvas || !canvas.getContext("2d")) {
      return;
    }
    setTimeout(() => {
      console.log("Drawing image on main canvas");
      canvas.getContext("2d")!.drawImage(img, 0, 0);
    }, 0);

    console.log("Creating temporary canvas");
    let tmpCanvas = document.createElement("canvas");
    let tmpCtx = tmpCanvas.getContext("2d");
    tmpCanvas.width = w;
    tmpCanvas.height = h;
    if (!tmpCtx) {
      console.error("Temporary canvas context not available");
      return;
    }
    console.log("Drawing image on temporary canvas");
    tmpCtx.drawImage(img, 0, 0);
    let imgData = tmpCtx.getImageData(0, 0, w, h);

    wasmimage.reuse(w, h, imgData.data as unknown as Uint8Array);
    ResizeCanvas(true);
  }

  function LoadImage(src: string | File) {
    let srcType: "url" | "file" = "url";

    if (src instanceof File) {
      srcType = "file";
    }

    let img = new Image();

    if (srcType === "url") {
      img.src = src as string;
      img.onload = () => {
        DrawImage(img);
        setImageSrc(img.src);
      };
    } else {
      let reader = new FileReader();
      reader.readAsDataURL(src as File);
      reader.onload = (event) => {
        if (event.target) {
          img.src = event.target.result as string;
          img.onload = () => {
            DrawImage(img);
            setImageSrc(img.src);
          };
        }
      };
    }
  }

  greet();
  return (
    <div className="h-screen w-screen font-[family-name:var(--font-geist-sans)]">
      <Canvas LoadImage={LoadImage} />
    </div>
  );
}
