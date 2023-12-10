<script setup lang="ts">
import Dialog from "@/components/Dialog.vue";
import { firebaseAuth } from "@/firebase";
import { useShortDialogStore } from "@/stores/short-dialog";
import { formatDate } from "@/utils/format";
import { ref } from "vue";
import { useCurrentUser } from "vuefire";

const props = defineProps<{ show: boolean }>();
const emit = defineEmits<(e: "close") => void>();
const user = useCurrentUser();
const dialogStore = useShortDialogStore();

const sendingVerificationEmail = ref(false);
const sendVerificationEmail = async () => {
  sendingVerificationEmail.value = true;
  await firebaseAuth.currentUser?.sendEmailVerification();
  sendingVerificationEmail.value = false;
  dialogStore.show("Verification email sent!");
};
const sendingPasswordResetEmail = ref(false);
const sendPasswordResetEmail = async () => {
  sendingPasswordResetEmail.value = true;
  await firebaseAuth.sendPasswordResetEmail(user.value?.email!);
  sendingPasswordResetEmail.value = false;
  dialogStore.show("Password reset email sent!");
};
</script>

<template>
  <Dialog :show="props.show" :closeOutside="true" @close="emit('close')">
    <template #header>
      <div class="flex items-center gap-3">Account</div>
    </template>
    <template #content>
      <div>Signed in as: {{ user?.displayName || user?.email }}</div>
      <div>
        Email: {{ user?.email }}
        <span v-if="!user?.emailVerified" class="text-red-500">
          <span class="material-symbols-outlined">warning </span>
          (not verified)
        </span>
      </div>
      <div>
        Sign-in methods:
        {{ user?.providerData.map((p) => p.providerId).join(", ") }}
      </div>
      <hr class="my-2" />
      <div class="text-right">
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
    </template>
  </Dialog>
</template>
