let remoteUserssAsJSON;
let newUser;

/**
 * Registers a new user by storing their information in the remote user database.
 * Clears the input fields after successful registration and redirects to the login page.
 * 
 * @returns {void}
 */
async function register() {
  let res = await getItem("usersRemote");
  remoteUserssAsJSON = await JSON.parse(res.data.value.replace(/'/g, '"'));
  let signupName = document.getElementById("signupName");
  let signupEmail = document.getElementById("signupEmail");
  let signupPassword = document.getElementById("signupPassword");
  newUser = {
    name: signupName.value,
    email: signupEmail.value,
    password: signupPassword.value,
  };
  remoteUserssAsJSON.push(newUser);
  await setItem("usersRemote", remoteUserssAsJSON);
  signupName.value = "";
  signupEmail.value = "";
  signupPassword.value = "";
  window.location.href = "login.html";
}
