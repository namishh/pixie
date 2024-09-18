import { useImageStore, useEditorStore } from "@/store/store";
import { Slider } from "../ui/slider";

export const Scale = ({
  Redraw,
}: {
  Redraw: (reposition: Boolean) => void;
}) => {
  const { getWasmImg } = useImageStore();
  const { factor, setFactor } = useEditorStore();

  const image = getWasmImg();
  return (
    <div className="flex top-0 left-0 absolute flex-col gap-2 p-3 bg-neutral-900 rounded-md border-[1px] border-neutral-700">
      <p className="text-sm">Scale</p>
      <Slider
        onValueChange={(i) => {
          setFactor(i[0]);
          image.scale(i[0] / 100);
          Redraw(false);
        }}
        min={10}
        className="w-48"
        defaultValue={[factor]}
        value={[factor]}
        max={200}
        step={1}
      />
      <div className="flex mt-2 gap-2">
        <div className="flex flex-col w-20">
          <p className="text-sm text-neutral-400 mb-2">Width</p>
          <div className="select-none bg-neutral-950 rounded-sm text-sm p-2 w-full border-neutral-700 border-[1px]">
            {(factor * image.width()) / 100}
          </div>
        </div>
        <div className="w-8 text-center text-neutral-400 self-end pb-2">x</div>
        <div className="flex flex-col w-20">
          <p className="text-sm text-neutral-400 mb-2">Height</p>
          <div className="select-none bg-neutral-950 rounded-sm text-sm p-2 w-full border-neutral-700 border-[1px]">
            {(factor * image.height()) / 100}
          </div>
        </div>
      </div>
      <div className="flex flex-col mt-2">
        <p className="text-sm text-neutral-400 mb-2">Ratio</p>
        <div className="select-none bg-neutral-950 rounded-sm text-sm p-2 w-full border-neutral-700 border-[1px]">
          {factor} %
        </div>
      </div>
    </div>
  );
};
