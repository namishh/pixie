import React, { useState, useRef, useEffect } from "react";
import { useEditorStore, useImageStore } from "@/store/store";
import { get_wasm_memory } from "../../pkg/foto";
import { Button } from "./ui/button";
interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Position {
  x: number;
  y: number;
}

interface ResizeHandle {
  position: string;
  handle: string;
}

export const CropHandlers = ({
  ResizeCanvas,
}: {
  ResizeCanvas: (autofit: boolean) => void;
}) => {
  const { width, height, zoomRatio, setWidthHeight, setShowCroppingHandlers } =
    useEditorStore();
  const { getWasmImg, setImgBuff } = useImageStore();

  const [box, setBox] = useState<Box>({ x: 0, y: 0, width: 200, height: 200 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [resizeHandle, setResizeHandle] = useState<string>("");
  const [startPos, setStartPos] = useState<Position>({ x: 0, y: 0 });

  const boxRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const Redraw = (reposition: Boolean) => {
    let wasmimage = getWasmImg();
    let w = wasmimage.width();
    let h = wasmimage.height();
    let pixptr = wasmimage.pixels();

    const memory = get_wasm_memory();

    const pixels = new Uint8ClampedArray(memory.buffer, pixptr, w * h * 4);
    createImageBitmap(new ImageData(new Uint8ClampedArray(pixels), w, h)).then(
      (img) => {
        setImgBuff(img);
        let ratio = zoomRatio;
        let canvas = document.getElementById("canvas") as HTMLCanvasElement;
        if (!canvas) return;
        canvas.width = Math.round(w * ratio);
        canvas.height = Math.round(h * ratio);
        let ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.scale(ratio, ratio);
        ctx.drawImage(img, 0, 0);

        if (reposition) {
          ResizeCanvas(true);
        }
        setWidthHeight(canvas.width, canvas.height);
      },
    );
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const dx = e.clientX - startPos.x;
        const dy = e.clientY - startPos.y;
        if (!containerRef.current) return;
        setBox((prevBox) => ({
          ...prevBox,
          x: Math.max(
            0,
            Math.min(
              prevBox.x + dx,
              containerRef.current!.offsetWidth - prevBox.width,
            ),
          ),
          y: Math.max(
            0,
            Math.min(
              prevBox.y + dy,
              containerRef.current!.offsetHeight - prevBox.height,
            ),
          ),
        }));
        setStartPos({ x: e.clientX, y: e.clientY });
      } else if (isResizing) {
        const dx = e.clientX - startPos.x;
        const dy = e.clientY - startPos.y;
        let newBox = { ...box };

        switch (resizeHandle) {
          case "n":
            newBox.y += dy;
            newBox.height -= dy;
            break;
          case "s":
            newBox.height += dy;
            break;
          case "w":
            newBox.x += dx;
            newBox.width -= dx;
            break;
          case "e":
            newBox.width += dx;
            break;
          case "nw":
            newBox.x += dx;
            newBox.y += dy;
            newBox.width -= dx;
            newBox.height -= dy;
            break;
          case "ne":
            newBox.y += dy;
            newBox.width += dx;
            newBox.height -= dy;
            break;
          case "sw":
            newBox.x += dx;
            newBox.width -= dx;
            newBox.height += dy;
            break;
          case "se":
            newBox.width += dx;
            newBox.height += dy;
            break;
        }

        // Ensure the box stays within bounds and maintains minimum size
        newBox.x = Math.max(0, newBox.x);
        newBox.y = Math.max(0, newBox.y);
        newBox.width = Math.max(
          50,
          Math.min(newBox.width, containerRef.current!.offsetWidth - newBox.x),
        );
        newBox.height = Math.max(
          50,
          Math.min(
            newBox.height,
            containerRef.current!.offsetHeight - newBox.y,
          ),
        );

        setBox(newBox);
        setStartPos({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isResizing, startPos, box, resizeHandle]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleResizeMouseDown = (
    e: React.MouseEvent<HTMLDivElement>,
    handle: string,
  ) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeHandle(handle);
    setStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleButtonClick = () => {
    console.log(
      `Box position: (${box.x}, ${box.y}), size: ${box.width}x${box.height}`,
    );
    const image = getWasmImg();
    image.crop(box.x, box.y, box.width, box.height);
    image.apply_change();
    Redraw(true);
    setShowCroppingHandlers(false);
  };

  const resizeHandles: ResizeHandle[] = [
    { position: "top-0 left-0 w-2 h-2 cursor-nw-resize", handle: "nw" },
    { position: "top-0 right-0 w-2 h-2 cursor-ne-resize", handle: "ne" },
    { position: "bottom-0 left-0 w-2 h-2 cursor-sw-resize", handle: "sw" },
    { position: "bottom-0 right-0 w-2 h-2 cursor-se-resize", handle: "se" },
    {
      position: "top-0 left-1/2 -translate-x-1/2 w-2 h-2 cursor-n-resize",
      handle: "n",
    },
    {
      position: "bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 cursor-s-resize",
      handle: "s",
    },
    {
      position: "left-0 top-1/2 -translate-y-1/2 w-2 h-2 cursor-w-resize",
      handle: "w",
    },
    {
      position: "right-0 top-1/2 -translate-y-1/2 w-2 h-2 cursor-e-resize",
      handle: "e",
    },
  ];

  return (
    <div
      ref={containerRef}
      style={{ width, height }}
      className={`absolute border-[4px] border-white container-to-follow`}
    >
      <div
        ref={boxRef}
        className="absolute bg-neutral-900/40 cursor-move"
        style={{
          left: `${box.x}px`,
          top: `${box.y}px`,
          width: `${box.width}px`,
          height: `${box.height}px`,
        }}
        onMouseDown={handleMouseDown}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <Button onClick={handleButtonClick}>Crop</Button>
        </div>
        {resizeHandles.map((handle, index) => (
          <div
            key={index}
            className={`absolute ${handle.position} bg-white`}
            onMouseDown={(e) => handleResizeMouseDown(e, handle.handle)}
          />
        ))}
      </div>
    </div>
  );
};
