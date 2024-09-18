import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { Image } from "../../pkg/foto";
import { produce } from "immer";

export interface StoreState {
  zoomRatio: number;
  width: number;
  height: number;

  setZoomRatio: (zoomRatio: number) => void;
  setImageSrc: (src: string) => void;
  setWidthHeight: (width: number, height: number) => void;

  imageUrl: string;
}

export const useEditorStore = create<StoreState>()(
  immer((set, get) => ({
    zoomRatio: 1,
    width: 0,
    height: 0,

    imageUrl: "/sample.jpg",
    setZoomRatio: (zoomRatio) =>
      set((state) => {
        state.zoomRatio = zoomRatio;
      }),

    setImageSrc: (src) =>
      set((state) => {
        state.imageUrl = src;
      }),

    setWidthHeight: (width, height) =>
      set((state) => {
        state.width = width;
        state.height = height;
      }),
  })),
);

interface ImageStore {
  img: Image | null; // Store the image object
  imgBuff: HTMLImageElement | ImageBitmap | null; // Buffer for frequent access to image data
  createImgObj: () => void; // Action to initialize the image object
  getWasmImg: () => Image; // Function to get the WASM image, initialize if needed
  setImgBuff: (buffer: HTMLImageElement) => void; // Action to set the image buffer
}

export const useImageStore = create<ImageStore>()(
  immer((set, get) => ({
    img: null,
    imgBuff: null,

    createImgObj: () => {
      const newImg = Image.new(0, 0, new Uint8Array(2));
      set((state) => {
        state.img = newImg;
      });
    },

    getWasmImg: () => {
      const { img, createImgObj } = get();
      if (!img) {
        createImgObj();
      }
      return get().img!;
    },

    // Set the image buffer
    setImgBuff: (buffer) => {
      set(
        produce((state) => {
          state.imgBuff = buffer;
        }),
      );
    },
  })),
);
