import { useEditorStore, useImageStore, useFilterStore } from "@/store/store";
import { SaveIcon, FolderOpen, Redo } from "lucide-react";
import { get_wasm_memory } from "../../pkg/foto";

export const SaveOpen = ({
  LoadImage,
}: {
  LoadImage: (img: string | File | null) => void;
}) => {
  const { resetFilters } = useFilterStore();
  const imageObject = useImageStore();
  const onFileChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    if (evt.target.files && evt.target.files.length > 0) {
      let file = evt.target.files[0];
      LoadImage(file);
      imageObject.setRotationAngle(0);
      resetFilters();
    }
  };

  const saveImage = () => {
    let wasm_img = imageObject.getWasmImg();
    let canvas = document.createElement("canvas");
    let w = wasm_img.width(); // if user scale down the img, but hasn't applied the change, the width/height is the scaled version
    let h = wasm_img.height(); // need to add a note, telling people not to forget to 'apply'
    canvas.width = w;
    canvas.height = h;
    let pixelPtr = wasm_img.pixels();
    let memory = get_wasm_memory();
    const pixels = new Uint8Array(memory.buffer, pixelPtr, w * h * 4);
    createImageBitmap(new ImageData(new Uint8ClampedArray(pixels), w, h)).then(
      (img) => {
        let ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (!blob) return;

          const date = new Date();
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          const hour = String(date.getHours()).padStart(2, "0");
          const minute = String(date.getMinutes()).padStart(2, "0");
          const second = String(date.getSeconds()).padStart(2, "0");
          const millisecond = String(date.getMilliseconds()).padStart(3, "0");

          const fileName = `${year}-${month}-${day}_${hour}-${minute}-${second}-${millisecond}.png`;

          let link = document.createElement("a");
          link.download = fileName;
          link.href = URL.createObjectURL(blob);
          link.click();
        }, "image/png");
      },
    );
  };

  return (
    <div className="top-4 fixed right-4 flex gap-4">
      <button className="flex gap-4 items-center p-2 bg-neutral-900 rounded-md border-[1px] border-neutral-700">
        <Redo
          onClick={() => {
            imageObject.setRotationAngle(0);
            resetFilters();
            LoadImage(null);
          }}
          size={20}
        />
      </button>
      <button className="flex gap-4 items-center p-2 bg-neutral-900 rounded-md border-[1px] border-neutral-700">
        <SaveIcon onClick={saveImage} size={20} />
      </button>
      <button className="flex gap-4 items-center p-2 bg-neutral-900 rounded-md border-[1px] border-neutral-700">
        <label className="cursor-pointer">
          <FolderOpen className="cursor-pointer" size={20} />

          <input
            onChange={onFileChange}
            type="file"
            accept="image/jpeg, image/png"
            style={{ display: "none" }}
          />
        </label>
      </button>
    </div>
  );
};
