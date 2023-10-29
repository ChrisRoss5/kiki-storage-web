interface ItemData {
  name: string;
  dateAdded: Date;
  dateModified: Date;
  path: string;
  isFolder: boolean;
  size?: number;
}

interface Item extends ItemData {
  isSelected?: boolean;
  isRenaming?: boolean;
  isDeleting?: boolean;
  isUploading?: boolean;
  isDownloading?: boolean;
}

interface FetchResult {
  count: number;
  error?: string;
}

