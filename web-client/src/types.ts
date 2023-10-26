interface Item {
  name: string;
  dateAdded: Date;
  dateModified: Date;
  path: string;
  isFolder: boolean;
  size?: number;
}

interface FetchResult {
  count: number;
  error?: string;
}