<script setup lang="ts">
import defaultPfp from "@/assets/default-pfp.webp";
import SettingsDialog from "@/components/settings/SettingsDialog.vue";
import { ref } from "vue";
import { useCurrentUser, useFirebaseAuth } from "vuefire";

const auth = useFirebaseAuth();
const user = useCurrentUser();

const showSettingsDialog = ref(false);
</script>

<template>
  <div class="dsy-dropdown">
    <label tabindex="0" class="cursor-pointer">
      <img
        alt="Profile picture"
        class="h-16 rounded-full"
        :src="user?.photoURL || defaultPfp"
        @error="($event.target as HTMLImageElement).src = defaultPfp"
      />
    </label>
    <ul
      tabindex="0"
      class="dsy-menu dsy-dropdown-content right-0 z-10 w-max rounded-box bg-base-100 p-2 text-right shadow-md"
    >
      <li>
        <div @click="showSettingsDialog = true" v-wave>
          Settings
          <span class="material-symbols-outlined"> settings </span>
        </div>
      </li>
      <li>
        <div @click="auth?.signOut" v-wave>
          Sign out
          <span class="material-symbols-outlined"> logout </span>
        </div>
      </li>
    </ul>
    <SettingsDialog
      :show="showSettingsDialog"
      @close="showSettingsDialog = false"
    />
  </div>
</template>
