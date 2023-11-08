const baseUrl = "http://localhost:3000";

export default {
  searchItems(filters: SearchFilters) {
    const searchParams = new URLSearchParams({
      query: filters.query,
      minSize: filters.minSize.toString(),
      maxSize: filters.maxSize.toString(),
      type: filters.type,
    });
    return _fetch<Item[]>(`searchItems?${searchParams}`, "GET", null, true);
  },
  getItems(path: string) {
    return _fetch<Item[]>(`getItems?path=${path}`, "GET", null, true);
  },
  async createItem(item: Item) {
    return (await this.createItems([item]))[0];
  },
  createItems(items: Item[]) {
    return _fetch<Item[]>("createItems", "POST", sanitize(items), true);
  },
  moveItems(items: Item[], newPath: string) {
    _fetch("moveItems", "PUT", { items: sanitize(items), newPath });
  },
  renameItem(item: Item) {
    const { newName } = item;
    _fetch("renameItem", "PUT", { item: sanitize(item), newName });
  },
  deleteItems(items: Item[]) {
    _fetch("deleteItems", "DELETE", sanitize(items));
  },
};

async function _fetch<T>(
  endpoint: string,
  method: string,
  body?: any,
  doFormatDates?: boolean
) {
  const res = await fetch(`${baseUrl}/${endpoint}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = (await res.json()) as T;
  return doFormatDates ? formatItems(json as ItemData[]) : json;
}

function formatItems(items: ItemData[]): Item[] {
  return items.map((i: Item) => {
    i.dateAdded = new Date(i.dateAdded);
    i.dateModified = new Date(i.dateModified);
    return i;
  });
}

function sanitize(item: Item): ItemData;
function sanitize(items: Item[]): ItemData[];
function sanitize(items: Item | Item[]): ItemData | ItemData[] {
  const transform = (i: Item): ItemData => ({
    id: i.id,
    name: i.name,
    path: i.path,
    dateAdded: i.dateAdded,
    dateModified: i.dateModified,
    isFolder: i.isFolder,
    size: i.size,
    type: i.type,
  });
  return Array.isArray(items) ? items.map(transform) : transform(items);
}
