import { reactive } from "vue";

const initialState = {
  isOpen: false,
  message: "",
  isError: false,
  handleConfirmation: null as
    | null
    | ((value: boolean | PromiseLike<boolean>) => void),
};

export default {
  state: reactive({ ...initialState }),
  show: function (_message = "") {
    this.state.isOpen = true;
    this.state.message = _message;
  },
  showError: function (_message = "") {
    this.state.isError = true;
    this.show(_message);
  },
  confirm: async function (_message = "") {
    this.show(_message);
    return new Promise<boolean>((resolve) => {
      this.state.handleConfirmation = resolve;
    });
  },
  close: function () {
    Object.assign(this.state, initialState);
  },
};
