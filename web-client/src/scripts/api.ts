export const api = {
  getItems: async (path: string) => {
    const result = await api.fetch(`getItems?path=${path}`, "GET");
    result.forEach((i: Item) => {
      i.dateAdded = new Date(i.dateAdded);
      i.dateModified = new Date(i.dateModified);
    });
    return result as Item[];
  },
  createItem: async (item: Item) => {
    return await api.createItems([item]);
  },
  createItems: async (items: Item[]) => {
    const result = await api.fetch("createItems", "POST", items);
    return result as FetchResult;
  },
  renameItem: async (item: Item, newName: string) => {
    const result = await api.fetch("renameItem", "PUT", {
      isFolder: item.isFolder,
      path: item.path,
      oldName: item.name,
      newName,
    });
    return result as FetchResult;
  },
  deleteItems: async (items: Item[]) => {
    const result = await api.fetch("deleteItems", "DELETE", items);
    return result as FetchResult;
  },
  fetch: async (endpoint: string, method: string, body?: any) => {
    const url = "http://localhost:3000/" + endpoint;
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    // console.log(json);
    return json;
  },
};
