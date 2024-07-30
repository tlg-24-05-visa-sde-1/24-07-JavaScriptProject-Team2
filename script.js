
/* Added event listener to the form for submit event */
document.getElementById('registrationForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const email = document.getElementById('email').value; // Gets email input value
    const password = document.getElementById('password').value; // Gets password input value
    const avatar = document.getElementById('avatar').files[0]; // Gets selected avatar file

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

    /* Creates new Filereader object to read the avatar file */
    const reader = new FileReader();
    reader.onload = function() {
        saveUserData(email, password, reader.result);
        };

    if (avatar) {
        reader.readAsDataURL(avatar);
    } else {
        saveUserData(email, password, null);
        }
    });
    
    function saveUserData(email, password, avatar) {
        const userData = {
            email: email,
            password: password,
            avatar: avatar
        };
        
        /* Saves user data to local storage, displays success message, and resets form fields */
        localStorage.setItem('userData', JSON.stringify(userData));
        alert('Registration Successful');
        document.getElementById('registrationForm').reset();
    }

