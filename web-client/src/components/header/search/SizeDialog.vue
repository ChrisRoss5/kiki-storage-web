<script setup lang="ts">
import Dialog from "@/components/Dialog.vue";
import { SizeFilter, useSearchStore } from "@/stores/search";
import { useShortDialogStore } from "@/stores/short-dialog";
import { toBytes, units } from "@/utils/format";
import { ref, watch } from "vue";

const props = defineProps<{ show: boolean }>();
const emit = defineEmits<(e: "close") => void>();

const searchStore = useSearchStore();
const dialogStore = useShortDialogStore();

const sizeFilter = ref<SizeFilter>({ ...searchStore.sizeFilter });

watch(
  () => props.show,
  (show) => {
    if (!show) return;
    sizeFilter.value = { ...searchStore.sizeFilter };
  }
);

const handleSearch = (e: MouseEvent) => {
  const minBytes = toBytes(sizeFilter.value.min, sizeFilter.value.minSuffix);
  const maxBytes = toBytes(sizeFilter.value.max, sizeFilter.value.maxSuffix);
  if (minBytes > maxBytes && maxBytes) {
    dialogStore.showError("Minimum size cannot be greater than maximum size.");
    return e.preventDefault();
  }
  searchStore.sizeFilter = { ...sizeFilter.value };
};
const handleClear = () => {
  searchStore.resetSizeFilter();
};
</script>

<template>
  <Dialog :show="props.show" :closeOutside="true" @close="emit('close')">
    <template #content>
      <div class="py-4 flex items-center gap-3">
        <div>Set minimum size:</div>
        <div class="flex-1 dsy-join border border-primary">
          <input
            v-model="sizeFilter.min"
            min="0"
            type="number"
            class="dsy-join-item w-full text-right p-1 pr-0"
          />
          <select
            v-model="sizeFilter.minSuffix"
            class="dsy-join-item pl-0 py-1"
          >
            <option v-for="suffix in units" :key="suffix">
              {{ suffix }}
            </option>
          </select>
        </div>
      </div>
      <div class="py-4 flex items-center gap-3">
        <div>Set maximum size:</div>
        <div class="flex-1 dsy-join border border-primary">
          <div class="relative w-full">
            <input
              v-model="sizeFilter.max"
              min="0"
              type="number"
              class="w-full dsy-join-item text-right p-1 pr-0"
            />
            <div
              v-if="!sizeFilter.max"
              class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none bg-[field] w-4 text-xl"
            >
              ∞
            </div>
          </div>
          <select
            v-model="sizeFilter.maxSuffix"
            class="dsy-join-item pl-0 py-1"
          >
            <option v-for="suffix in units" :key="suffix">
              {{ suffix }}
            </option>
          </select>
        </div>
      </div>
    </template>
    <template #actions>
      <form method="dialog">
        <button class="dsy-btn dsy-btn-primary" @click="handleSearch">
          Search
        </button>
        <button class="dsy-btn" @click="handleClear">Clear</button>
      </form>
    </template>
  </Dialog>
</template>
