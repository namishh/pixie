import {
  RotateCcw,
  RotateCw,
  FlipVertical,
  FlipHorizontal,
} from "lucide-react";

import { useImageStore } from "@/store/store";
import { Slider } from "../ui/slider";

export const Rotate = ({
  Redraw,
}: {
  Redraw: (reposition: Boolean) => void;
}) => {
  const { getWasmImg, rotationAngle, setRotationAngle } = useImageStore();
  const rotatecw = () => {
    const image = getWasmImg();
    image.degrees_rotate(90);
    setRotationAngle(90);
    image.apply_change();
    Redraw(true);
  };
  const rotateccw = () => {
    const image = getWasmImg();
    image.degrees_rotate(-90);
    setRotationAngle(-90);
    image.apply_change();
    Redraw(true);
  };
  const flipv = () => {
    const image = getWasmImg();
    image.flip_v();
    image.apply_change();
    Redraw(true);
  };
  const fliph = () => {
    const image = getWasmImg();
    image.flip_h();
    image.apply_change();
    Redraw(true);
  };
  return (
    <div className="flex w-36 absolute top-0 left-0 flex-col gap-2 p-3 bg-neutral-900 rounded-md border-[1px] border-neutral-700">
      <p className="text-sm">Rotate</p>
      <div className="flex gap-4">
        <RotateCw onClick={rotatecw} className="cursor-pointer" size={18} />
        <RotateCcw onClick={rotateccw} className="cursor-pointer" size={18} />
        <FlipHorizontal onClick={fliph} className="cursor-pointer" size={18} />
        <FlipVertical onClick={flipv} className="cursor-pointer" size={18} />
      </div>

      <p className="text-sm">Angle</p>
      <Slider
        onValueChange={(i) => {
          setRotationAngle(i[0]);
          const image = getWasmImg();
          image.degrees_rotate(i[0]);
          image.apply_change();
          Redraw(true);
        }}
        min={0}
        className="w-full"
        defaultValue={[rotationAngle]}
        value={[rotationAngle]}
        max={360}
        step={1}
      />
    </div>
  );
};
