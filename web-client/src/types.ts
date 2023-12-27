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
  isSelected?: boolean;
  isRenaming?: boolean;
  newName?: string;
  storageFile?: any; // No type for ReturnType<typeof useStorageFile>
}
interface ItemsDragData {
  items: Item[];
  uid?: string;
}
interface SearchFilters {
  query: string;
  minSize: number;
  maxSize: number;
  type: string;
}
interface Settings {
  hideFilesInTree: boolean;
  desktopZoom: number;
  mobileZoom: number;
  theme: Theme;
  columns: ColumnSettings;
  searchColumns: ColumnSettings;
  view: ExplorerView;
  searchView: ExplorerView;
  tabs: Tab[];
  activeTabId: TabId;
}
interface Tab {
  id: TabId;
  path: string;
  expandedPaths?: string[];
  fileTreeWidth?: number;
}
type TabId = string; // ReturnType<typeof crypto.randomUUID>; // Ditched because it only works with SSL
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
