export const roots = {
  drive: { name: "Drive", icon: "cloud" },
  shared: { name: "Shared", icon: "cloud" },
  bin: { name: "Bin", icon: "cloud" },
};

export const defaultRoot = "drive" satisfies keyof typeof roots;

const defaultActiveTab = { path: defaultRoot, id: crypto.randomUUID() };

export default {
  theme: "light",
  columns: {
    order: ["name", "size", "type", "dateAdded", "dateModified"],
    orderBy: "name",
    orderDesc: false,
  },
  searchColumns: {
    order: ["name", "size", "type", "dateAdded", "dateModified"],
    orderBy: "name",
    orderDesc: false,
  },
  view: "list",
  searchView: "list", // todo?
  tabs: [defaultActiveTab],
  activeTabId: defaultActiveTab.id,
} satisfies Settings;

export const columnNames: Partial<Record<keyof ItemCore, string>> = {
  name: "Name",
  size: "Size",
  type: "Type",
  dateAdded: "Date added",
  dateModified: "Date modified",
};
