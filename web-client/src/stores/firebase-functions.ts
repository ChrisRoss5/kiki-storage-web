import {
  getFunctions,
  connectFunctionsEmulator,
  httpsCallable,
} from "firebase/functions";
import { defineStore } from "pinia";

export const useFunctionsStore = defineStore("firebase-functions", () => {
  const functions = getFunctions();

  if (import.meta.env.DEV) {
    connectFunctionsEmulator(functions, "127.0.0.1", 5001);
  }

  const api = {
    deleteAccount() {
      return httpsCallable(functions, "deleteAccount")();
    },
  };

  return { api };
});
