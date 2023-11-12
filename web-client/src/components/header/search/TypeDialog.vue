<script setup lang="ts">
import Dialog from "@/components/Dialog.vue";
import { useSearchStore } from "@/stores/search";
import { ref, watch } from "vue";

const props = defineProps<{ show: boolean }>();
const emit = defineEmits<(e: "close") => void>();

const searchStore = useSearchStore();

const types = ref(searchStore.type);
const isFiles = ref(true);

watch(
  () => props.show,
  (show) => {
    if (!show) return;
    isFiles.value = searchStore.type != "Folders";
    if (isFiles.value && searchStore.type != "Files")
      types.value = searchStore.type;
  }
);

const handleSearch = () => {
  searchStore.type = isFiles.value ? types.value || "Files" : "Folders";
};
const handleClear = () => {
  searchStore.type = "";
};
</script>

<template>
  <Dialog
    :show="props.show"
    :closeOutside="true"
    :modalBoxStyle="{ 'min-width': 'min(30rem, 100vw)' }"
    @close="emit('close')"
  >
    <template #content>
      <div class="py-4 flex items-center gap-3">
        <div>Search for:</div>
        <div
          class="flex-1 grid grid-flow-col text-center dsy-join border border-primary"
        >
          <div
            class="dsy-join-item"
            :class="{ 'bg-primary text-primary-content': isFiles }"
            @click="isFiles = true"
            v-wave
          >
            Files
          </div>
          <div
            class="dsy-join-item"
            :class="{ 'bg-primary text-primary-content': !isFiles }"
            @click="isFiles = false"
            v-wave
          >
            Folders
          </div>
        </div>
      </div>
      <div v-if="isFiles">
        Enter comma separated file extensions:
        <input
          v-model.trim="types"
          type="text"
          class="dsy-input dsy-input-bordered dsy-input-primary w-full mt-3"
          placeholder="Leave blank to search all files"
        />
      </div>
    </template>
    <template #actions>
      <form method="dialog">
        <button class="dsy-btn dsy-btn-primary" @click="handleSearch">
          Search
        </button>
        <button class="dsy-btn">Cancel</button>
        <button class="dsy-btn" @click="handleClear">Clear</button>
      </form>
    </template>
  </Dialog>
</template>
