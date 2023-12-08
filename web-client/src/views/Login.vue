<script setup lang="ts">
import Logo from "@/components/Logo.vue";
import { useFirebaseUI } from "@/firebase";
import getDefaultSettings from "@/stores/settings/default";
import { useTabsStore } from "@/stores/tabs";
import "firebaseui/dist/firebaseui.css";
import { onMounted } from "vue";
import { useRouter } from "vue-router";

const ui = useFirebaseUI();
const router = useRouter();
const tabsStore = useTabsStore();

onMounted(() => {
  ui.reset();
  ui.start("#firebaseui-auth-container", {
    // As of 2023, Facebook auth is no longer supported without a verified business account
    signInOptions: [
      "google.com",
      "twitter.com",
      "github.com",
      "microsoft.com",
      "yahoo.com",
      "password",
      {
        provider: "phone",
        defaultCountry: "HR",
      },
    ],
    signInFlow: "popup",
    callbacks: {
      signInSuccessWithAuthResult: (authResult) => {
        if (authResult.additionalUserInfo.isNewUser) {
          const { theme } = getDefaultSettings();
          localStorage.setItem("theme", theme);
          document.documentElement.dataset.theme = theme;
          tabsStore.initOnRegister().then(() => router.push("/"));
        } else router.push("/");
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
