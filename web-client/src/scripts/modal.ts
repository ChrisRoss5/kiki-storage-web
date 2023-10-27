import { reactive, watch } from "vue";

export const defaultState = {
  trigger: 0,
  message: "",
  isError: false,
  isConfirmation: false,
  isConfirmed: null as boolean | null,
}

export const state = reactive(defaultState);

export function show(_message = "") {
  state.message = _message;
  state.trigger++;
}

export function showError(_message = "") {
  state.message = _message;
  state.isError = true;
  state.trigger++;
}

export function showConfirm(_message = "") {
  state.message = _message;
  state.isConfirmation = true;
  state.trigger++;
  return new Promise((resolve) => {
    watch(() => state.isConfirmed, () => {
      console.log("confirmed");
      resolve(state.isConfirmed);
    });
  });
}

export function reset() {
  Object.assign(state, defaultState);
}