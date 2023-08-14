/**
 * Grants or sets access by updating the 'accessGranted' flag in the local storage.
 */
function grantAccess() {
  localStorage.setItem("accessGranted", true);
}

/**
 * Removes access by updating the 'accessGranted' flag in the local storage.
 */
function removeAccess() {
  localStorage.setItem("accessGranted", false);
}

/**
 * Checks if a user is logged in and redirects to the login page if not.
 */
function checkifLoggedIn() {
  if (!isLoggedIn()) {
    window.location.href = "login.html";
  }
}

/**
 * Checks if a user is currently logged in based on the 'accessGranted' flag in local storage.
 * @returns {boolean} Returns true if the user is logged in, false otherwise.
 */
function isLoggedIn() {
  return localStorage.getItem("accessGranted") === "true";
}
