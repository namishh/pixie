import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { Image } from "../../pkg/foto";
import { produce } from "immer";

export interface StoreState {
  zoomRatio: number;
  width: number;
  height: number;
  factor: number;
  canvas: HTMLCanvasElement | null;
  showCroppingHandlers: boolean;
  showCanvasBorder: boolean;

  setCanvasBorder: (showCanvasBorder: boolean) => void;
  setShowCroppingHandlers: (s: boolean) => void;
  setCanvas: (canvas: HTMLCanvasElement) => void;
  setFactor: (factor: number) => void;
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
    showCanvasBorder: false,
    factor: 100,
    imageUrl: "/logo.jpg",
    canvas: null,
    showCroppingHandlers: false,

    setCanvas: (canvas) =>
      set(produce((state) => {
        state.canvas = canvas;
      })),

    setZoomRatio: (zoomRatio) =>
      set((state) => {
        state.zoomRatio = zoomRatio;
      }),

    setCanvasBorder: (showCanvasBorder) =>
      set((state) => {
        state.showCanvasBorder = showCanvasBorder;
      }),

    setShowCroppingHandlers: (s) =>
      set((state) => {
        state.showCroppingHandlers = s;
      }),

    setFactor: (factor) =>
      set((state) => {
        state.factor = factor;
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
  rotationAngle: number;
  setRotationAngle: (deg: number) => void;
  setImgBuff: (buffer: HTMLImageElement | ImageBitmap) => void; // Action to set the image buffer
}

export const useImageStore = create<ImageStore>()(
  immer((set, get) => ({
    img: null,
    imgBuff: null,

    rotationAngle: 0,
    createImgObj: () => {
      const newImg = Image.new(0, 0, new Uint8Array(2));
      set((state) => {
        state.img = newImg;
      });
    },

    setRotationAngle: (deg) =>
      set((state) => {
        state.rotationAngle = deg;
      }),

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
