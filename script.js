
/*------------- LOGIN/SIGNUP NAVIGATION ------------*/
document
  .getElementById("login-signup-container")
  .addEventListener("click", handleLoginSignup);

//Login/Signup Event Handler
function handleLoginSignup(event) {
    const homeScreen = document.getElementById('home-screen');
  
   
  if (event.target.classList.contains("signup-button")) {
    signupEvent;
  } else if (event.target.classList.contains("login-button")) {
    loginEvent;
  }
}

function signupEvent() {
  //TODO:CODE For Signup
}

function loginEvent() {
  //TODO:Code for Login
}
