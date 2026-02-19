import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: "dark",
  wallpaper: localStorage.getItem("chat-wallpaper") || "https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png",

  setTheme: (theme) => {
    set({ theme });
  },

  setWallpaper: (wallpaper) => {
    localStorage.setItem("chat-wallpaper", wallpaper);
    set({ wallpaper });
  },
}));
