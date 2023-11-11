interface ItemData {
  id?: number;
  name: string;
  type: string;
  dateAdded: Date;
  dateModified: Date;
  path: string;
  isFolder: boolean;
  size?: number;
}

interface Item extends ItemData {
  el?: HTMLElement;
  searchEl?: HTMLElement;
  isSelected?: boolean;
  isRenaming?: boolean;
  isDeleting?: boolean; // todo
  isUploading?: boolean; // todo
  isDownloading?: boolean; // todo
  isSearched?: boolean;
  newName?: string;
}

interface SearchFilters {
  query: string;
  minSize: number;
  maxSize: number;
  type: string;
}

interface Settings {
  theme: Theme
}

type Theme =
  | "light"
  | "dark"
  | "cupcake"
  | "bumblebee"
  | "emerald"
  | "corporate"
  | "synthwave"
  | "retro"
  | "cyberpunk"
  | "valentine"
  | "halloween"
  | "garden"
  | "forest"
  | "aqua"
  | "lofi"
  | "pastel"
  | "fantasy"
  | "wireframe"
  | "black"
  | "luxury"
  | "dracula"
  | "cmyk"
  | "autumn"
  | "business"
  | "acid"
  | "lemonade"
  | "night"
  | "coffee"
  | "winter";