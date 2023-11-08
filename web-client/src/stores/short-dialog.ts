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

export const useShortDialogStore = defineStore("short-dialog", () => {
  const state = reactive({ ...initialState });

  const show = (message = "") => {
    Object.assign(state, { ...initialState, isOpen: true, message });
  };
  const showError = (message = "") => {
    show(message);
    state.isError = true;
  };
  const confirm = (message = "") => {
    show(message);
    return new Promise<boolean>((resolve) => {
      state.handleConfirmation = resolve;
    });
  };
  const close = () => {
    if (state.handleConfirmation) state.handleConfirmation(false);
    state.isOpen = false;
  };

  return { state, show, showError, confirm, close };
});
