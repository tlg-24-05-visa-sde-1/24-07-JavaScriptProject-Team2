
/* Added event listener to the form for submit event */
document.getElementById('registrationForm').addEventListener('submit', function(event) {
    event.preventDefault();
 
    const email = document.getElementById('email').value; // Gets email input value
    const password = document.getElementById('password').value; // Gets password input value
 
    const emailError = document.getElementById('emailError'); // Gets the email error element
    const passwordError = document.getElementById('passwordError'); // Gets password error element
 
    /* Clears previous email and password error messages */
    emailError.textContent = '';
    passwordError.textContent = '';
 
    /* Regular expression for email validation */
    const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
    if (!email.match(emailPattern)) {
        emailError.textContent = 'Invalid email format';
        return;
    }
 
    /* Regular expression for password validation */
    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!password.match(passwordPattern)) {
        passwordError.textContent = 'Password must be at least 8 characters long and contain at least one number';
        return;
    }
 
    saveUserData(email, password);
});
 
function saveUserData(email, password) {
    const userData = {
        email: email,
        password: password
    };
    // Retrieves existing user data from local storage
    let storedUsers = JSON.parse(localStorage.getItem('usersData')) || [];
    storedUsers.push(userData);
   
    /* Saves updated user data array to local storage, displays success message, and resets form fields */
    localStorage.setItem('usersData', JSON.stringify(storedUsers));
    alert('Registration Successful');
    document.getElementById('registrationForm').reset();
}

