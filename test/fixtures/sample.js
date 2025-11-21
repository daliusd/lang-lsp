// JavaScript test file for lang-lsp
// Hover over language keys to see translations

const messages = {
  welcome: "user.welcome",
  goodbye: "user.goodbye",
  login: "user.login",
  logout: "user.logout"
};

const errors = {
  notFound: "error.not-found",
  unauthorized: "error.unauthorized",
  server: "error.server"
};

function translate(key) {
  // Hover over these keys
  if (key === "user.welcome") {
    return "Welcome!";
  }
  if (key === "error.not-found") {
    return "Not found!";
  }
  return key;
}

// React-like usage
const Component = () => {
  return {
    saveButton: "button.save",
    cancelButton: "button.cancel",
    submitButton: "button.submit",
    successMessage: "message.success"
  };
};

module.exports = { messages, errors, translate, Component };
