import { defaultRoot } from "@/stores/path";

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
