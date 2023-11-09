<script setup lang="ts">
import Logo from "@/components/Logo.vue";
import CreateOrUpload from "./CreateOrUpload.vue";
import Search from "./search/Search.vue";
import { useFirebaseAuth } from "vuefire";
import { ref } from "vue";
import SettingsDialog from "@/components/settings/SettingsDialog.vue";

const auth = useFirebaseAuth();
const showSettingsDialog = ref(false);
</script>

<template>
  <div class="flex items-center gap-5 p-5">
    <Logo />
    <CreateOrUpload />
    <Search class="relative flex-1" @click.stop="null" />
    <div class="dsy-dropdown">
      <label tabindex="0" class="cursor-pointer">
        <img alt="" class="rounded-full h-14" src="@/assets/default-pfp.webp" />
      </label>
      <ul
        tabindex="0"
        class="dsy-dropdown-content z-[1] p-2 shadow bg-base-100 rounded-box right-0 w-max text-right"
      >
        <li>
          <div
            @click="showSettingsDialog = true"
            class="dsy-btn dsy-btn-ghost"
            v-wave
          >
            Settings
            <span class="material-symbols-outlined"> settings </span>
          </div>
        </li>
        <li>
          <div
            @click="auth?.signOut"
            class="dsy-btn dsy-btn-ghost text-right"
            v-wave
          >
            Sign out
            <span class="material-symbols-outlined"> logout </span>
          </div>
        </li>
      </ul>
    </div>
    <SettingsDialog
      :show="showSettingsDialog"
      @close="showSettingsDialog = false"
    />
  </div>
</template>
