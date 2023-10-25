interface Item {
  name: string;
  dateAdded: Date;
  path: string;
}

interface File extends Item {
  size: number;
  type: string;
}

interface Folder extends Item {
  files?: File[];
  folders?: Folder[];
}
