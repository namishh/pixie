import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { Image } from "../../pkg/foto";

export interface StoreState {
  zoomRatio: number;
  width: number;
  height: number;

  setZoomRatio: (zoomRatio: number) => void;
  setWidthHeight: (width: number, height: number) => void;
  imageUrl: string;

  imageObject: {
    getWASMImage: () => Image;
    imageBuffer: Image | null;
  };
}

export const editorStore = create<StoreState>()(
  immer((set) => ({
    zoomRatio: 1,
    width: 0,
    height: 0,

    imageUrl: "/sample.jpg",

    imageObject: {
      getWASMImage: () => {
        return Image.new(0, 0, new Uint8Array(2));
      },
      imageBuffer: null,
    },

    setZoomRatio: (zoomRatio) =>
      set((state) => {
        state.zoomRatio = zoomRatio;
      }),

    setWidthHeight: (width, height) =>
      set((state) => {
        state.width = width;
        state.height = height;
      }),
  })),
);
