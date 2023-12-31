import { inEditable } from "@/utils";
import { defineStore } from "pinia";
import { ref } from "vue";
import { useNotificationStore } from "../notification";
import { ItemStore } from "./manager";

type ItemProp = keyof Pick<Item, "isCopied" | "isCut">;

export const useClipboardStore = defineStore("clipboard", () => {
  const notifStore = useNotificationStore();

  const items = ref<Item[]>([]);
  const prop = ref<ItemProp>("isCut");

  const copy = (_items: Item[]) =>
    load(_items, "isCopied", `Copied ${_items.length} item(s).`);
  const cut = (_items: Item[]) =>
    load(_items, "isCut", `Cut ${_items.length} item(s).`);
  const paste = (itemStore: ItemStore) => {
    if (!items.value.length || inEditable()) return;
    if (prop.value == "isCopied") itemStore.handleCopy(items.value);
    else if (prop.value == "isCut") itemStore.handleMove(items.value);
    empty();
  };

  const load = (_items: Item[], _prop: ItemProp, message: string) => {
    for (const item of items.value) item[prop.value] = false;
    if (!_items.length || inEditable()) return;
    items.value = _items;
    prop.value = _prop;
    for (const item of items.value) item[prop.value] = true;
    notifStore.create({ message, duration: 2000 });
  };
  const empty = () => {
    for (const item of items.value) item[prop.value] = false;
    items.value = [];
  };

  return { items, copy, cut, paste, empty };
});
