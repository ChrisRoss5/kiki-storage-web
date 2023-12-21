<script setup lang="ts">
import { useItemsStorageStore } from "@/stores/items/firebase/storage";
import { formatSize } from "@/utils/format";
import { computed } from "vue";

const itemsStorage = useItemsStorageStore();
const items = computed(() => itemsStorage.itemsUploading);
const totalSize = computed(() =>
  items.value.reduce((acc, item) => acc + item.size!, 0),
);
const allItemsPaused = computed(() =>
  items.value.every((i) => i.storageFile?.snapshot.state == "paused"),
);
const someItemsPaused = computed(() =>
  items.value.some((i) => i.storageFile?.snapshot.state == "paused"),
);
const totalUploaded = computed(() =>
  items.value.reduce(
    (acc, item) =>
      acc +
      (item.storageFile?.snapshot.state == "success"
        ? item.size!
        : item.storageFile?.snapshot.bytesTransferred ?? 0),
    0,
  ),
);
</script>

<template>
  <Transition name="slide-up">
    <div
      id="uploads"
      v-if="items.length"
      class="group absolute bottom-20 left-1/2 z-10 flex w-full -translate-x-1/2 flex-col rounded-box bg-base-100 shadow-lg sm:w-[40rem]"
    >
      <div
        class="max-h-0 overflow-y-scroll p-3 py-0 transition-[max-height,padding] group-hover:max-h-[25rem] group-hover:py-3"
      >
        <TransitionGroup name="rows">
          <div
            v-for="item in items"
            :key="item.id"
            class="flex items-center gap-3 py-2 leading-5"
          >
            <div
              class="dsy-loading dsy-loading-spinner text-secondary transition-opacity"
              :class="{
                'opacity-0': item.storageFile?.snapshot.state != 'running',
              }"
            ></div>
            <div class="flex-1 overflow-hidden break-words">
              <div>Uploading to {{ item.path }}:</div>
              <div>{{ item.name }}</div>
              <strong class="block whitespace-nowrap text-right">
                {{ formatSize(item.storageFile?.snapshot.bytesTransferred) }} /
                {{ formatSize(item.size) }}
              </strong>
              <progress
                class="dsy-progress dsy-progress-secondary h-1 w-full"
                :value="
                  (item.storageFile?.snapshot.bytesTransferred || 0) /
                  item.size!
                "
                max="1"
              ></progress>
            </div>
            <div>
              <div
                v-if="item.storageFile?.snapshot.state == 'paused'"
                class="dsy-tooltip dsy-tooltip-left cursor-pointer pr-1"
                data-tip="Resume upload"
              >
                <div
                  class="material-symbols-outlined !text-3xl text-primary"
                  @click="itemsStorage.api.resumeUpload(item)"
                >
                  play_circle
                </div>
              </div>
              <div
                v-else
                class="dsy-tooltip dsy-tooltip-left cursor-pointer pr-1"
                data-tip="Pause upload"
              >
                <div
                  class="material-symbols-outlined !text-3xl text-primary"
                  @click="itemsStorage.api.pauseUpload(item)"
                >
                  pause_circle
                </div>
              </div>
              <div
                class="dsy-tooltip dsy-tooltip-left cursor-pointer"
                data-tip="Cancel upload"
              >
                <div
                  class="material-symbols-outlined !text-3xl text-primary"
                  @click="itemsStorage.api.cancelUpload(item)"
                >
                  cancel
                </div>
              </div>
            </div>
          </div>
        </TransitionGroup>
      </div>
      <div class="flex items-center gap-3 p-3 py-3">
        <div
          class="dsy-loading dsy-loading-spinner dsy-loading-lg text-secondary transition-opacity"
          :class="{ 'opacity-0': allItemsPaused }"
        ></div>
        <div class="flex-1">
          Uploading {{ items.length }} {{ items.length > 1 ? "files" : "file" }}
          <strong class="float-right">
            {{ formatSize(totalUploaded) }} / {{ formatSize(totalSize) }}
          </strong>
          <progress
            class="dsy-progress dsy-progress-secondary w-full"
            :value="totalUploaded / totalSize"
            max="1"
          ></progress>
        </div>
        <div>
          <div
            v-if="someItemsPaused"
            class="dsy-tooltip cursor-pointer"
            data-tip="Resume upload"
          >
            <div
              class="material-symbols-outlined !text-5xl text-primary"
              @click="itemsStorage.api.resumeUploads"
            >
              play_circle
            </div>
          </div>
          <div
            v-else
            class="dsy-tooltip cursor-pointer"
            data-tip="Pause upload"
          >
            <div
              class="material-symbols-outlined !text-5xl text-primary"
              @click="itemsStorage.api.pauseUploads"
            >
              pause_circle
            </div>
          </div>
          <div class="dsy-tooltip cursor-pointer" data-tip="Cancel all uploads">
            <div
              class="material-symbols-outlined !text-5xl text-primary"
              @click="itemsStorage.api.cancelUploads"
            >
              cancel
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition:
    transform 300ms,
    opacity 300ms;
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translate(-50%, 0.5rem);
}
</style>
@/stores/items/firebase/storage
