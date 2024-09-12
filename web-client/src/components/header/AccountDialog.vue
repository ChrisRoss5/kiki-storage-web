<script setup lang="ts">
import Dialog from "@/components/Dialog.vue";
import { firebaseAuth } from "@/firebase";
import { useFunctionsStore } from "@/stores/firebase-functions";
import { useItemFirestoreStore } from "@/stores/items/firebase/firestore";
import { useItemStorageStore } from "@/stores/items/firebase/storage";
import { useSettingsStore } from "@/stores/settings";
import { useShortDialogStore } from "@/stores/short-dialog";
import { formatDate } from "@/utils/format";
import { ref, watch } from "vue";
import { useCurrentUser } from "vuefire";

const props = defineProps<{ show: boolean }>();
const emit = defineEmits<(e: "close") => void>();

const user = useCurrentUser();
const dialogStore = useShortDialogStore();
const { api: firestoreApi } = useItemFirestoreStore();
const { api: storageApi } = useItemStorageStore();
const { api: functionsApi } = useFunctionsStore();
const settingsStore = useSettingsStore();

const sendingVerificationEmail = ref(false);
const sendingPasswordResetEmail = ref(false);
const accountDeleteStatus = ref("");

watch(
  () => props.show,
  (show) => {
    if (show) {
      sendingVerificationEmail.value = false;
      sendingPasswordResetEmail.value = false;
      accountDeleteStatus.value = "";
    }
  },
);

const sendVerificationEmail = async () => {
  sendingVerificationEmail.value = true;
  await firebaseAuth.currentUser?.sendEmailVerification();
  sendingVerificationEmail.value = false;
  dialogStore.show("Verification email sent!");
};
const sendPasswordResetEmail = async () => {
  sendingPasswordResetEmail.value = true;
  await firebaseAuth.sendPasswordResetEmail(user.value?.email!);
  sendingPasswordResetEmail.value = false;
  dialogStore.show("Password reset email sent!");
};
const deleteAccount = async () => {
  const email = user.value?.email;
  if (!await confirmDeleteAccount()) return;
  if (window.useFirebaseFunctions) {
    accountDeleteStatus.value =
      "Deleting items, files, settings and account...";
    try {
      await functionsApi.deleteAccount();
      await firebaseAuth.signOut();
    } catch {
      return reauthenticate();
    }
  } else {
    accountDeleteStatus.value = "Deleting items...";
    await firestoreApi.deleteAll();
    accountDeleteStatus.value = "Deleting files...";
    await storageApi.deleteAll();
    accountDeleteStatus.value = "Deleting settings...";
    await settingsStore.deleteAll();
    accountDeleteStatus.value = "Deleting account...";
    try {
      await firebaseAuth.currentUser?.delete();
    } catch {
      return reauthenticate();
    }
  }
  emit("close");
  dialogStore.show(`Account ${email} deleted.`);
};
const confirmDeleteAccount = async () => {
  const message1 =
    "This irreversible action will lead to the permanent loss of all your data, " +
    "and please be aware that no backups will be retained. " +
    "Additionally, all shared data will no longer be accessible";
  if (!(await dialogStore.confirm(message1))) return false;
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const message2 =
    "Are you absolutely certain you want to proceed with deleting your account?";
  if (!(await dialogStore.confirm(message2))) return false;
  return true;
};
const reauthenticate = async () => {
  const message =
    "You must reauthenticate before deleting your account. " +
    "Would you like to reauthenticate now?";
  if (await dialogStore.confirm(message)) firebaseAuth.signOut();
  return emit("close");
};
</script>

<template>
  <Dialog :show="props.show" :closeOutside="true" @close="emit('close')">
    <template #header> Account </template>
    <template #content>
      <div>
        Signed in as: {{ user?.displayName || user?.email || "Unknown" }}
      </div>
      <div>
        Email: {{ user?.email || "No email" }}
        <span v-if="!user?.emailVerified" class="text-red-500">
          <span class="material-symbols-outlined">warning </span>
          (not verified)
        </span>
      </div>
      <div>
        Sign-in methods:
        {{ user?.providerData.map((p) => p.providerId).join(", ") }}
      </div>
      <div class="pt-2 text-right">
        Last sign-in:
        {{ formatDate(new Date(user?.metadata.lastSignInTime!)) }}
      </div>
      <div class="text-right">
        Sign-up:
        {{ formatDate(new Date(user?.metadata.creationTime!)) }}
      </div>
    </template>
    <template #actions>
      <div class="flex">
        <button
          v-if="!user?.emailVerified"
          class="dsy-btn"
          :class="{ 'dsy-btn-disabled': sendingVerificationEmail }"
          @click.prevent="sendVerificationEmail"
          v-wave
        >
          <span
            class="dsy-loading-xm dsy-loading dsy-loading-dots"
            v-if="sendingVerificationEmail"
          ></span>
          <span> Send verification email </span>
        </button>
        <button
          class="dsy-btn ml-3"
          :class="{ 'dsy-btn-disabled': sendingPasswordResetEmail }"
          @click.prevent="sendPasswordResetEmail"
          v-wave
        >
          <span
            class="dsy-loading-xm dsy-loading dsy-loading-dots"
            v-if="sendingPasswordResetEmail"
          ></span>
          Send password reset email
        </button>
      </div>
      <button
        class="dsy-btn float-right mt-3"
        :class="{ 'dsy-btn-disabled': sendingPasswordResetEmail }"
        @click.prevent="deleteAccount"
        v-wave
      >
        <span
          class="dsy-loading-xm dsy-loading dsy-loading-dots"
          v-if="accountDeleteStatus"
        ></span>
        Delete account
      </button>
    </template>
  </Dialog>
</template>
