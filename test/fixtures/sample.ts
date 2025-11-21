// Test file for lang-lsp hover functionality
// Hover over the language keys (strings in quotes) to see translations

// User messages
const welcomeMessage = "user.welcome";
const goodbyeMessage = "user.goodbye";
const loginPrompt = "user.login";
const logoutMessage = "user.logout";

// Error messages
const notFoundError = "error.not-found";
const unauthorizedError = "error.unauthorized";
const serverError = "error.server";

// Button labels
const saveButton = "button.save";
const cancelButton = "button.cancel";
const submitButton = "button.submit";
const deleteButton = "button.delete";

// Status messages
const successMessage = "message.success";
const warningMessage = "message.warning";
const infoMessage = "message.info";

function displayMessage(key: string) {
  console.log(`Displaying: ${key}`);
}

// Test with single quotes
const singleQuoteTest = 'user.welcome';
const anotherTest = 'error.not-found';

// Test in template strings (these won't be detected by current pattern)
const templateTest = `user.welcome`;

// Test with expressions
displayMessage("button.save");
displayMessage("message.success");

export { welcomeMessage, saveButton };
