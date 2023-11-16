<script setup lang="ts">
import defaultPfp from "@/assets/default-pfp.webp";
import Logo from "@/components/Logo.vue";
import SettingsDialog from "@/components/settings/SettingsDialog.vue";
import { ref } from "vue";
import { useCurrentUser, useFirebaseAuth } from "vuefire";
import CreateOrUpload from "./CreateOrUpload.vue";
import Search from "./search/Search.vue";

const auth = useFirebaseAuth();
const user = useCurrentUser();

const showSettingsDialog = ref(false);
</script>

<template>
  <div class="flex items-center gap-5 p-5">
    <Logo />
    <CreateOrUpload />
    <Search class="relative flex-1" @click.stop="null" />
    <div class="dsy-dropdown">
      <label tabindex="0" class="cursor-pointer">
        <img
          alt=""
          class="rounded-full h-16"
          :src="user?.photoURL || defaultPfp"
          @error="($event.target as HTMLImageElement).src = defaultPfp"
        />
      </label>
      <ul
        tabindex="0"
        class="dsy-dropdown-content z-10 p-2 shadow bg-base-100 rounded-box right-0 w-max text-right"
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
