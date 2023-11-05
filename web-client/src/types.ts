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