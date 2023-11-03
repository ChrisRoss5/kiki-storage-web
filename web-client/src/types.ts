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
  isSelected?: boolean;
  isRenaming?: boolean;
  isDeleting?: boolean; // todo
  isUploading?: boolean; // todo
  isDownloading?: boolean; // todo
  isSearched?: boolean;
  isSearchedNew?: boolean;
}
