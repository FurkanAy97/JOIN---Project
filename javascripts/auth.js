function grantAccess() {
  localStorage.setItem("accessGranted", true);
}

function removeAccess(){
    localStorage.setItem("accessGranted", false);
}

function checkifLoggedIn(){
  if (!isLoggedIn()) {
    window.location.href = "login.html";
  }
}

function isLoggedIn() {
  return localStorage.getItem("accessGranted") === "true";
}