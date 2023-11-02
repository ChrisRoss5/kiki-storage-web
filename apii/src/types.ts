interface Item {
  name: string;
  dateAdded: Date;
  dateModified: Date;
  path: string;
  isFolder: boolean;
  size?: number;
  type?: string;
}

interface ItemWithId extends Item {
  id: number;
}
