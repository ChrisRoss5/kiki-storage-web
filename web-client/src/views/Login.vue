<script setup lang="ts">
import Logo from "@/components/Logo.vue";
import { useFirebaseUI } from "@/firebase";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import firebase from "firebase/compat/app";
import "firebaseui/dist/firebaseui.css";
import { onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

// Until the firebaseui YOLO bug is fixed showOneTapLogin() is the alterative, pasted from:
// https://contextify.dev/blog/google-one-tap-login-firebase/
if (window.google) {
  showOneTapLogin();
} else {
  const googleScript = document.getElementById("google-gsi-script")!;
  googleScript.addEventListener("load", () => {
    showOneTapLogin();
  });
}

function showOneTapLogin() {
  const client_id =
    "251749769626-c2ffkkp0mgatm0dptf4grpqtjr4mmioc.apps.googleusercontent.com"; // OAuth2 client id

  const handleCredentialResponse = (response: any) => {
    signInWithCredential(
      getAuth(),
      GoogleAuthProvider.credential(response.credential),
    )
      .then(() => {
        router.push("/");
      })
      .catch((error: any) => {
        console.error("firebase error", error);
      });
  };

  const nativeCallback = () => console.log("native_callback!");
  window.google.accounts.id.initialize({
    client_id,
    callback: handleCredentialResponse,
    auto_select: true,
    context: "use",
    native_callback: nativeCallback,
  });
  window.google.accounts.id.prompt((notification: any) => {
    console.log("notification is: ", notification.getMomentType());
    if (notification.isDisplayMoment()) {
      console.log("IS DISPLAY MOMENT");
    }
    if (notification.isNotDisplayed()) {
      console.warn(
        "one-tap did not show because:",
        notification.getNotDisplayedReason(),
      );
    }
    if (notification.isSkippedMoment()) {
      console.warn("one-tap skipped because:", notification.getSkippedReason());
    }
    if (notification.isDismissedMoment()) {
      console.warn(
        "one-tap dismissed because:",
        notification.getDismissedReason(),
      );
    }
  });
}

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
    // BUG: https://github.com/firebase/firebaseui-web/issues/1079
    // credentialHelper: auth.CredentialHelper.GOOGLE_YOLO,
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
    <div class="border-y-2 border-base-300 py-5 backdrop-blur-sm">
      <Logo :is-login="true" class="flex-col gap-3 text-black" />
      <div id="firebaseui-auth-container" class="pt-5"></div>
    </div>
  </div>
</template>
