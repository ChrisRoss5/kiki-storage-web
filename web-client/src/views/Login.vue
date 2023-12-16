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
  <div id="login" class="flex h-screen flex-col justify-center">
    <Logo :is-login="true" class="mb-5 flex-col gap-3 text-black" />
    <div id="firebaseui-auth-container" class="overflow-auto"></div>
  </div>
</template>

<style>
#login {
  background:
    radial-gradient(#fff 20%, transparent),
    conic-gradient(
        #fff,
        #8f9cac,
        #02bd7e,
        #db4437,
        #720e9e,
        #2f2f2f,
        #333333,
        #3b5998,
        #55acee,
        #fff
      )
      no-repeat;
}
</style>
