import { RotateCcw, CropIcon, Scaling, ArrowDownRight } from "lucide-react";

import { useEditorStore, useImageStore } from "@/store/store";
import { get_wasm_memory } from "../../../pkg/foto";

import { Rotate } from "./Rotate";

import { useState } from "react";

export const Toolbar = ({
  ResizeCanvas,
}: {
  ResizeCanvas: (autofit: Boolean) => void;
}) => {
  const { zoomRatio } = useEditorStore();
  const { imgBuff, getWasmImg, setImgBuff } = useImageStore();
  const [openRotate, setOpenRotate] = useState(false);
  
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
      },
    );
  };

  return (
    <>
      <div className="fixed top-4 left-4 flex flex-col gap-4">
        <div className="flex flex-col gap-4 p-3 bg-neutral-900 rounded-md border-[1px] border-neutral-700">
          <RotateCcw onClick={() => setOpenRotate(!openRotate)} className="cursor-pointer" size={20} />
          <CropIcon className="cursor-pointer" size={20} />
          <Scaling className="cursor-pointer" size={20} />
          <ArrowDownRight className="cursor-pointer" size={22} />
        </div>
      </div>
      <div className="top-4 left-20 fixed">
        {openRotate && <Rotate Redraw={Redraw} />}
      </div>
    </>
  );
};

export default Toolbar;