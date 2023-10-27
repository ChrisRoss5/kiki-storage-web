const baseUrl = "http://localhost:3000";

export default {
  getItems: async (path: string) => {
    const result = await _fetch(`getItems?path=${path}`, "GET");
    result.forEach((i: Item) => {
      i.dateAdded = new Date(i.dateAdded);
      i.dateModified = new Date(i.dateModified);
    });
    return result as Item[];
  },
  createItem: async function(item: Item) {
    return await this.createItems([item]);
  },
  createItems: async (items: Item[]) => {
    const result = await _fetch("createItems", "POST", items);
    return result as FetchResult;
  },
  renameItem: async (item: Item, newName: string) => {
    const result = await _fetch("renameItem", "PUT", {
      isFolder: item.isFolder,
      path: item.path,
      oldName: item.name,
      newName,
    });
    return result as FetchResult;
  },
  deleteItems: async (items: Item[]) => {
    const result = await _fetch("deleteItems", "DELETE", items);
    return result as FetchResult;
  },
};

async function _fetch(endpoint: string, method: string, body?: any) {
  const res = await fetch(`${baseUrl}/${endpoint}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  // console.log(json);
  return json;
}
