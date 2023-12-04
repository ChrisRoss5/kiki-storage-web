<script setup lang="ts">
import Logo from "@/components/Logo.vue";
import { useFirebaseUI } from "@/firebase";
import "firebaseui/dist/firebaseui.css";
import { onMounted } from "vue";

const ui = useFirebaseUI();

onMounted(() => {
  ui.reset();
  ui.start("#firebaseui-auth-container", {
    signInOptions: [
      "google.com",
      "twitter.com",
      "facebook.com",
      "github.com",
      "microsoft.com",
      "yahoo.com",
      "password",
      "phone",
    ],
    signInFlow: "popup",
  });
});
</script>

<template>
  <div id="login-grid" class="flex h-screen flex-col justify-center">
    <Logo class="mb-5 flex-col gap-3 text-black" />
    <div id="firebaseui-auth-container" class="overflow-auto"></div>
  </div>
</template>

<style>
#login-grid {
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
