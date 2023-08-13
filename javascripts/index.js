/**
    Initializes the login page by executing fadeInAnimation and changeLogoColor functions.
    @function
    @name initLoginPage
    */
function initLoginPage() {
  fadeInAnimation();
  changeLogoColor();
}

/**
 * initializes the application for a guest user
 * @async
 */
async function initGuestJOIN() {
  await setItem("currentUserName", { name: "Dear Guest" });
  await setItem("tasksRemote", tasks);
  grantAccess();
  window.location.href = "summary.html";
}

/**
    Executes the fade-in animation on the login and sign-up containers, and changes the logo image after a timeout.
    @function
    @name fadeInAnimation
    */
function fadeInAnimation() {
  const logo = document.querySelector(".logo-big");
  setTimeout(function () {
    logo.src = "assets/icons/logo-black.png";
    window.location.href = "login.html";
  }, 1500);
}

/**

    Changes the color of the logo and the background color of the animation layer based on the window width.
    @function
    @name changeLogoColor
    */
function changeLogoColor() {
  if (window.innerWidth < 800) {
    const logo = document.querySelector(".logo-big");
    logo.src = "assets/icons/logo-white-blue.png";
    document.querySelector(".logo-layer").style.backgroundColor = "#2A3647";
  } else {
    document.querySelector(".animation-layer").style.backgroundColor = "white";
  }
}

/**
 *
 * Changes the arrow left color based on the window width
 * @function
 * @name changeArrowColor
 */
function changeArrowColor() {
  const arrow = document.getElementById("blueArrowLeft");
  if (window.innerWidth < 800) {
    arrow.src = "assets/icons/arrow-left-black.png";
  } else {
    arrow.src = "assets/icons/arrow-left.png";
  }
}
if (window.location.href.includes("sign_up.html")) {
  window.addEventListener("resize", changeArrowColor);
}

//---------------------logout popup window ---------------//

/**
 * Toggles the visibility of the logout popup and overlay layer.
 * @returns {void}
 */
function toggleLogout() {
  const logoutPopup = document.getElementById("logout");
  const logoutLayer = document.getElementById("logoutLayer");
  logoutPopup.classList.toggle("d-none");
  logoutLayer.classList.toggle("d-none");
}

/**
 * Redirects the user back to the login page and updates session status.
 * @returns {void}
 */
function backToLogin() {
  window.location.href = "login.html";
  isActive = true;
  sessionStorage.setItem("isActive", JSON.stringify(isActive));
}
//---------------------logout popup window ---------------//

//--------------------------select category----------------------------//

/**
 * Highlights the selected menu item and removes selection from others.
 * @param {string} menu - The identifier of the selected menu item.
 * @returns {void}
 */
function selectedMenu(menu) {
  try {
    let elem = document.querySelectorAll(".menuText");
    let selected = document.getElementById(`${menu}`);

    if (selected) {
      for (let k = 0; k < elem.length; k++) {
        elem[k].classList.remove("selectedMenu");
      }
      selected.classList.add("selectedMenu");
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

//------------------------------------------------------//

/**
 * Checks the entered login credentials against remote user data and navigates if valid.
 * @returns {void}
 */
async function checkPassword() {
  try {
    const enteredLoginPassword = document.getElementById("enteredLoginPassword");
    const enteredLoginEmail = document.getElementById("enteredLoginEmail");
    const res = await getItem("usersRemote");
    const remoteUsersAsJSON = JSON.parse(res.data.value.replace(/'/g, '"'));
    const currentUser = remoteUsersAsJSON.find((user) => user.email === enteredLoginEmail.value);
    setRememberMe();
    checkIfUserExist(currentUser, enteredLoginPassword, enteredLoginEmail);
    passwordValidation(currentUser, enteredLoginPassword, enteredLoginEmail);
  } catch (error) {
    console.error("An error occurred:", error);
    showPopup("An error occurred.");
  }
}

function setRememberMe() {
  const rememberMeCheckbox = document.getElementById("rememberMeCheckbox");
  const enteredLoginEmail = document.getElementById("enteredLoginEmail").value;

  if (rememberMeCheckbox.checked) {
    localStorage.setItem("email", JSON.stringify(enteredLoginEmail));
  }
}

function rememberMe() {
  let savedEmail = localStorage.getItem("email");
  if (savedEmail) {
    document.getElementById("enteredLoginEmail").value = JSON.parse(savedEmail);
  }
}

/**
 * Checks if the user exists based on the current user data.
 * @param {Object|null} currentUser - The current user data if found, or null if not found.
 * @param {HTMLInputElement} enteredLoginPassword - The password input field.
 * @param {HTMLInputElement} enteredLoginEmail - The email input field.
 * @returns {void}
 */
function checkIfUserExist(currentUser, enteredLoginPassword, enteredLoginEmail) {
  if (!currentUser) {
    showPopup("User not found.");
    emptyInputFields(enteredLoginPassword, enteredLoginEmail);
    return;
  }
}

/**
 * Validates the entered password and performs actions based on validation results.
 * @param {Object|null} currentUser - The current user data if found, or null if not found.
 * @param {HTMLInputElement} enteredLoginPassword - The password input field.
 * @param {HTMLInputElement} enteredLoginEmail - The email input field.
 * @returns {void}
 */
async function passwordValidation(currentUser, enteredLoginPassword, enteredLoginEmail) {
  if (currentUser.password === enteredLoginPassword.value) {
    await setItem("currentUserName", { name: currentUser.name });
    grantAccess();
    window.location.href = "summary.html";
  } else {
    emptyInputFields(enteredLoginPassword, enteredLoginEmail);
    showPopup("Incorrect password.");
  }
}

/**
 * Clears the values of the provided input fields.
 * @param {HTMLInputElement} enteredLoginPassword - The input field for the login password.
 * @param {HTMLInputElement} enteredLoginEmail - The input field for the login email.
 * @returns {void}
 */
function emptyInputFields(enteredLoginPassword, enteredLoginEmail) {
  enteredLoginPassword.value = "";
  enteredLoginEmail.value = "";
}

/**
 * Displays a popup message on the screen.
 * @param {string} message - The message to be displayed in the popup.
 * @returns {void}
 */
function showPopup(message) {
  const popup = document.getElementById("loginPopup");
  popup.innerHTML = message;
  popup.style.opacity = "1";
  setTimeout(() => {
    popup.style.opacity = "0";
  }, 1500);
  document.addEventListener("click", function () {
    popup.style.opacity = "0";
  });
}
