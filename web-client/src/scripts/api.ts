const baseUrl = "http://localhost:3000";

export default {
  async getItems(path: string) {
    const result = await _fetch(`getItems?path=${path}`, "GET");
    result.forEach((i: Item) => {
      i.dateAdded = new Date(i.dateAdded);
      i.dateModified = new Date(i.dateModified);
    });
    return result as Item[];
  },
  async createItem(item: Item) {
    return await this.createItems([item]);
  },
  async createItems(items: Item[]) {
    const result = await _fetch("createItems", "POST", items);
    return result as FetchResult;
  },
  async renameItem(item: Item, newName: string) {
    const result = await _fetch("renameItem", "PUT", {
      isFolder: item.isFolder,
      path: item.path,
      oldName: item.name,
      newName,
    });
    return result as FetchResult;
  },
  async deleteItems(items: Item[]) {
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
