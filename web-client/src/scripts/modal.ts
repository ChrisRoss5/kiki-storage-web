import { reactive } from "vue";

export const state = reactive({
  trigger: 0,
  message: "",
  isError: false,
});

export function show(_message = "") {
  state.message = _message;
  state.isError = false;
  state.trigger++;
}

export function showError(_message = "") {
  state.message = _message;
  state.isError = true;
  state.trigger++;
}

export default {
  state,
  show,
  showError,
};
