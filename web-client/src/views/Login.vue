<script setup lang="ts">
import Logo from "@/components/Logo.vue";
import { useFirebaseUI } from "@/firebase";
import firebase from "firebase/compat/app";
import { auth } from "firebaseui";
import "firebaseui/dist/firebaseui.css";
import { onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

onMounted(() => {
  const ui = useFirebaseUI();
  ui.reset();
  ui.start("#firebaseui-auth-container", {
    // As of 2023, Facebook auth is no longer supported without a verified business account
    // https://github.com/firebase/firebaseui-web#available-providers
    signInOptions: [
      {
        provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        clientId:
          "251749769626-c2ffkkp0mgatm0dptf4grpqtjr4mmioc.apps.googleusercontent.com",
      },
      firebase.auth.TwitterAuthProvider.PROVIDER_ID,
      firebase.auth.GithubAuthProvider.PROVIDER_ID,
      "microsoft.com",
      "yahoo.com",
      firebase.auth.EmailAuthProvider.PROVIDER_ID,
      {
        provider: firebase.auth.PhoneAuthProvider.PROVIDER_ID,
        defaultCountry: "HR",
      },
    ],
    // Required to enable one-tap sign-up credential helper.
    credentialHelper: auth.CredentialHelper.GOOGLE_YOLO,
    signInFlow: "popup",
    callbacks: {
      signInSuccessWithAuthResult: () => {
        router.push("/");
        return false;
      },
    },
  });
});
</script>

<template>
  <div id="login" class="grid items-center overflow-auto">
    <div class="backdrop-blur-sm border-y-2 border-base-300 py-5">
      <Logo :is-login="true" class="flex-col gap-3 text-black" />
      <div id="firebaseui-auth-container" class="pt-5"></div>
    </div>
  </div>
</template>
