<script setup lang="ts">
import defaultPfp from "@/assets/default-pfp.webp";
import { ref } from "vue";
import { useCurrentUser, useFirebaseAuth } from "vuefire";
import SettingsDialog from "../settings/SettingsDialog.vue";
import AccountDialog from "./AccountDialog.vue";
import HelpDialog from "./HelpDialog.vue";

const auth = useFirebaseAuth();
const user = useCurrentUser();

const showAccountDialog = ref(false);
const showSettingsDialog = ref(false);
const showHelpDialog = ref(false);

type MenuItem = {
  name: string;
  icon: string;
  onClick: () => void;
};
const items: MenuItem[] = [
  {
    name: "Account",
    icon: "Person",
    onClick: () => (showAccountDialog.value = true),
  },
  {
    name: "Settings",
    icon: "settings",
    onClick: () => (showSettingsDialog.value = true),
  },
  {
    name: "Help",
    icon: "help",
    onClick: () => (showHelpDialog.value = true),
  },
  {
    name: "Sign out",
    icon: "logout",
    onClick: () => auth?.signOut(),
  },
];
</script>

<template>
  <div class="dsy-dropdown dsy-dropdown-hover">
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
      <li v-for="item in items" :key="item.name">
        <div @click="item.onClick" v-wave class="text-right">
          {{ item.name }}
          <span class="material-symbols-outlined"> {{ item.icon }} </span>
        </div>
      </li>
    </ul>
    <AccountDialog
      :show="showAccountDialog"
      @close="showAccountDialog = false"
    />
    <SettingsDialog
      :show="showSettingsDialog"
      @close="showSettingsDialog = false"
    />
    <HelpDialog :show="showHelpDialog" @close="showHelpDialog = false" />
  </div>
</template>
