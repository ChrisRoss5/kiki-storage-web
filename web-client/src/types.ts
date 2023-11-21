interface ItemCore {
  id?: string;
  name: string;
  type: string;
  dateAdded: Date;
  dateModified: Date;
  path: string;
  isFolder: boolean;
  size?: number;
}

interface Item extends ItemCore {
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
  theme: Theme;
  columns: ColumnSettings;
  searchColumns: ColumnSettings;
  view: ExplorerView;
  searchView: ExplorerView;
}

type ExplorerView = "list" | "grid";

interface ColumnSettings {
  order: Partial<keyof ItemCore>[];
  orderBy: keyof ItemCore;
  orderDesc: boolean;
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
