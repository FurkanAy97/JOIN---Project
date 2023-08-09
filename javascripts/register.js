let remoteUserssAsJSON;
let newUser;

/**
 * Registers a new user by adding their information to the remote database,
 * then redirects to the login page.
 * @async
 */
async function register() {
  try {
    let res = await getItem("usersRemote");
    handleEmptyRes(res);
    let signupName = document.getElementById("signupName");
    let signupEmail = document.getElementById("signupEmail");
    let signupPassword = document.getElementById("signupPassword");
    addNewUser(signupName, signupEmail, signupPassword);
    remoteUserssAsJSON.push(newUser);
    await setItem("usersRemote", remoteUserssAsJSON);
    emptyInputFields(signupName, signupEmail, signupPassword);
    window.location.href = "login.html";
  } catch (error) {
    console.error("An error occurred during registration:", error);
  }
}

/**
 * Handles empty response from the remote database by initializing or parsing the user data.
 * @param {object} res - The response object from the remote database.
 */
function handleEmptyRes(res) {
  if (!res || !res.data || !res.data.value) {
    remoteUserssAsJSON = [];
  } else {
    remoteUserssAsJSON = JSON.parse(res.data.value.replace(/'/g, '"'));
  }
}

/**
 * Creates a new user object with provided signup information.
 * @param {HTMLInputElement} signupName - The input element for user's name.
 * @param {HTMLInputElement} signupEmail - The input element for user's email.
 * @param {HTMLInputElement} signupPassword - The input element for user's password.
 */
function addNewUser(signupName, signupEmail, signupPassword) {
  newUser = {
    name: signupName.value,
    email: signupEmail.value,
    password: signupPassword.value,
  };
}

/**
 * Clears the input fields after registration.
 * @param {HTMLInputElement} signupName - The input element for user's name.
 * @param {HTMLInputElement} signupEmail - The input element for user's email.
 * @param {HTMLInputElement} signupPassword - The input element for user's password.
 */
function emptyInputFields(signupName, signupEmail, signupPassword) {
  signupName.value = "";
  signupEmail.value = "";
  signupPassword.value = "";
}
