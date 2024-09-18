import {
  RotateCcw,
  RotateCw,
  FlipVertical,
  FlipHorizontal,
} from "lucide-react";

import { useImageStore } from "@/store/store";

export const Rotate = ({
  Redraw,
}: {
  Redraw: (reposition: Boolean) => void;
}) => {
  const { getWasmImg } = useImageStore();
  const rotatecw = () => {
    const image = getWasmImg();
    image.rotate(true);
    Redraw(false);
  };
  const rotateccw = () => {
    const image = getWasmImg();
    image.rotate(false);
    Redraw(false);
  };
  const flipv = () => {
    const image = getWasmImg();
    image.flip_v();
    Redraw(false);
  };
  const fliph = () => {
    const image = getWasmImg();
    image.flip_h();
    Redraw(false);
  };
  return (
    <div className="flex w-36 flex-col gap-2 p-3 bg-neutral-900 rounded-md border-[1px] border-neutral-700">
      <p className="text-sm">Rotate</p>
      <div className="flex gap-4">
        <RotateCw onClick={rotatecw} className="cursor-pointer" size={18} />
        <RotateCcw onClick={rotateccw} className="cursor-pointer" size={18} />
        <FlipHorizontal onClick={fliph} className="cursor-pointer" size={18} />
        <FlipVertical onClick={flipv} className="cursor-pointer" size={18} />
      </div>
    </div>
  );
};
