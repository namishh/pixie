import { useEditorStore } from "@/store/store";
import { SaveIcon, FolderOpen } from "lucide-react";

export const SaveOpen = ({
  LoadImage,
}: {
  LoadImage: (img: string | File | null) => void;
}) => {
  const { setZoomRatio, zoomRatio } = useEditorStore();
  const onFileChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    if (evt.target.files && evt.target.files.length > 0) {
      let file = evt.target.files[0];
      LoadImage(file);
    }
  };
  return (
    <div className="top-4 fixed right-4 flex gap-4">
      <button className="flex gap-4 items-center p-2 bg-neutral-900 rounded-md border-[1px] border-neutral-700">
        <SaveIcon size={20} />
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
