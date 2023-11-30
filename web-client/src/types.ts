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
  newName?: string;
  storageFile?: any; // No type for ReturnType<typeof useStorageFile>
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
  tabs: Tab[];
  activeTabId: TabId;
}
interface Tab {
  id: TabId;
  path: string;
}
type TabId = ReturnType<typeof crypto.randomUUID>;
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
