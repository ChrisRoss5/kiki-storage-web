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
    callbacks: {
      signInSuccessWithAuthResult: (r) => {
        console.log(r);  // todo
        return false;
      },
    },
  });
});
</script>

<template>
  <div id="login-grid" class="flex flex-col justify-center h-screen">
    <Logo class="mb-5 flex-col gap-3" />
    <div id="firebaseui-auth-container"></div>
  </div>
</template>

<style scoped>
#login-grid {
  background: radial-gradient(#fff 20%, transparent),
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
