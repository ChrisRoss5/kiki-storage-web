interface Item {
  name: string;
  dateAdded: Date;
  dateModified: Date;
  path: string;
  isFolder: boolean;
  size?: number;
}

interface ItemWithId extends Item {
  id: number;
}
