const baseUrl = "http://localhost:3000";

export default {
  async getItems(path: string) {
    const items = await _fetch<ItemData[]>(`getItems?path=${path}`, "GET");
    items.forEach((i) => {
      i.dateAdded = new Date(i.dateAdded);
      i.dateModified = new Date(i.dateModified);
    });
    return items;
  },
  async createItem(item: Item) {
    return (await this.createItems([item]))[0];
  },
  createItems(items: Item[]) {
    return _fetch<ItemData[]>("createItems", "POST", sanitize(items));
  },
  moveItems(items: Item[], newPath: string) {
    _fetch("moveItems", "PUT", { items: sanitize(items), newPath });
  },
  renameItem(item: Item, oldName: string, newName: string) {
    _fetch("renameItem", "PUT", {
      isFolder: item.isFolder,
      path: item.path,
      oldName,
      newName,
    });
  },
  deleteItems(items: Item[]) {
    _fetch("deleteItems", "DELETE", sanitize(items));
  },
};

async function _fetch<T>(endpoint: string, method: string, body?: any) {
  const res = await fetch(`${baseUrl}/${endpoint}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as T;
  // console.log(json);
  return json;
}

function sanitize(items: Item[]): ItemData[] {
  return items.map((i) => {
    return {
      id: i.id,
      isFolder: i.isFolder,
      name: i.name,
      path: i.path,
      dateAdded: i.dateAdded,
      dateModified: i.dateModified,
    };
  });
}
