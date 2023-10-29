import { defineStore } from "pinia";
import { reactive } from "vue";

const initialState = {
  isOpen: false,
  message: "",
  isError: false,
  handleConfirmation: null as
    | null
    | ((value: boolean | PromiseLike<boolean>) => void),
};

export const useDialogStore = defineStore("dialog", () => {
  const state = reactive({ ...initialState });

  function show(_message = "") {
    state.isOpen = true;
    state.message = _message;
  }
  function showError(_message = "") {
    state.isError = true;
    show(_message);
  }
  async function confirm(_message = "") {
    show(_message);
    return new Promise<boolean>((resolve) => {
      state.handleConfirmation = resolve;
    });
  }
  function close() {
    if (state.handleConfirmation) state.handleConfirmation(false);
    Object.assign(state, initialState);
  }

  return { state, show, showError, confirm, close };
});
