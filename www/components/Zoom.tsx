import { ZoomOut, ZoomIn, Undo2 } from "lucide-react";
import { Slider } from "./ui/slider";
import { useEditorStore } from "@/store/store";

export const Zoom = ({
  ResizeCanvas,
}: {
  ResizeCanvas: (autofit: Boolean) => void;
}) => {
  const { setZoomRatio, zoomRatio } = useEditorStore();
  return (
    <div className="bottom-4 fixed right-4 flex gap-4">
      <button
        onClick={() => ResizeCanvas(true)}
        className="flex gap-4 items-center p-2 bg-neutral-900 rounded-md border-[1px] border-neutral-700"
      >
        <Undo2 size={20} />
      </button>
      <div className="flex gap-4 items-center py-2 px-4 bg-neutral-900 rounded-md border-[1px] border-neutral-700">
        <ZoomOut size={20} />
        <Slider
          onValueChange={(i) => {
            setZoomRatio(i[0] / 100);
          }}
          min={10}
          className="w-48"
          value={[zoomRatio * 100]}
          max={200}
          step={1}
        />
        <ZoomIn size={20} />
        <p className="min-w-6">{Number(Number(zoomRatio) * 100).toFixed(0)}%</p>
      </div>
    </div>
  );
};
