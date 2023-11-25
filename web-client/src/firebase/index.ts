import { initializeApp } from "firebase/app";
import { auth } from "firebaseui";
import { setLogLevel } from "firebase/firestore";
import { useFirebaseAuth } from "vuefire";

export const firebaseApp = initializeApp({
  apiKey: "AIzaSyAHN2MNGn8iTJAuzmgkYszyrS7m9tDEGeU",
  authDomain: "dropbox-clone-716f7.firebaseapp.com",
  databaseURL:
    "https://dropbox-clone-716f7-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "dropbox-clone-716f7",
  storageBucket: "dropbox-clone-716f7.appspot.com",
  messagingSenderId: "251749769626",
  appId: "1:251749769626:web:01acdca36bf995f6b3da23",
});

//setLogLevel("debug"); // todo

let ui: auth.AuthUI;

export function useFirebaseUI() {
  ui ??= new auth.AuthUI(useFirebaseAuth());
  return ui;
}
