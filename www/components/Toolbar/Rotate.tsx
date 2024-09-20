import {
  RotateCcw,
  RotateCw,
  FlipVertical,
  FlipHorizontal,
} from "lucide-react";

import { useImageStore } from "@/store/store";
import { Slider } from "../ui/slider";
import { Dispatch, SetStateAction, useState } from "react";

import { Switch } from "../ui/switch";

export const Rotate = ({
  MenuOpen,
  Redraw,
}: {
  MenuOpen: Dispatch<SetStateAction<boolean>>;
  Redraw: (reposition: Boolean) => void;
}) => {
  const { getWasmImg, rotationAngle, setRotationAngle } = useImageStore();
  const [preview, setPreview] = useState(false);
  const image = getWasmImg();

  const rotatecw = () => {
    image.perpendicular_rotate(true);
    if (rotationAngle + 90 > 360) {
      const remaining = rotationAngle + 90 - 360;
      setRotationAngle(remaining);
    } else {
      setRotationAngle(rotationAngle + 90);
    }
    image.apply_change();
    Redraw(true);
  };

  const rotateccw = () => {
    image.perpendicular_rotate(false);
    if (rotationAngle - 90 < 0) {
      const remaining = 360 - (90 - rotationAngle);
      setRotationAngle(remaining);
    } else {
      setRotationAngle(rotationAngle - 90);
    }
    image.apply_change();
    Redraw(true);
  };
  const flipv = () => {
    image.flip_v();
    image.apply_change();
    Redraw(true);
  };
  const fliph = () => {
    image.flip_h();
    image.apply_change();
    Redraw(true);
  };
  return (
    <div className="flex w-48 absolute top-16 left-0 flex-col gap-2 p-3 bg-neutral-900 rounded-md border-[1px] border-neutral-700">
      <p className="text-sm">Rotate</p>
      <div className="flex gap-4">
        <RotateCw onClick={rotatecw} className="cursor-pointer" size={18} />
        <RotateCcw onClick={rotateccw} className="cursor-pointer" size={18} />
        <FlipHorizontal onClick={fliph} className="cursor-pointer" size={18} />
        <FlipVertical onClick={flipv} className="cursor-pointer" size={18} />
      </div>

      <p className="text-sm mt-2">Angle</p>
      <Slider
        onValueCommit={(i) => {
          if (!preview) {
            image.degrees_rotate(i[0]);
            Redraw(false);
          }
          image.apply_change();
        }}
        onValueChange={(i) => {
          if (preview) {
            image.degrees_rotate(i[0]);
            Redraw(false);
          }
          setRotationAngle(i[0]);
        }}
        min={0}
        className="w-full mb-2"
        defaultValue={[rotationAngle]}
        value={[rotationAngle]}
        max={360}
        step={1}
      />

      <div className="flex gap-3 items-center">
        <Switch
          checked={preview}
          onCheckedChange={() => {
            setPreview(!preview);
          }}
        />
        <p className="text-neutral-400 text-xs">Preview Rotation</p>
      </div>
    </div>
  );
};
