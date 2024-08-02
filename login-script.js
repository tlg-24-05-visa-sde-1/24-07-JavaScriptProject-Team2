document.getElementById('loginForm').addEventListener('submit', function(event) {
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
 
    if (password === '') {
        passwordError.textContent = 'Password cannot be empty';
        return;
    }
 
    const usersData = JSON.parse(localStorage.getItem('usersData')) || [];
 
    const user = usersData.find(user => user.email === email && user.password === password);
 
    if (user) {
        alert('Login successful');
        window.location.href = './pages/Trending-Music/main-page.html'; // Redirect to main-page.html on successful login
    } else {
        alert('Invalid email or password, please try again');
    }
});
 