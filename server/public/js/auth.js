// Toggle password visibility
document.addEventListener('DOMContentLoaded', function() {
  // For login page
  const loginToggle = document.querySelector('#login-page #togglePassword');
  if (loginToggle) {
    loginToggle.addEventListener('click', function() {
      const passwordInput = document.querySelector('#login-page #password');
      const icon = this.querySelector('i');
      togglePasswordVisibility(passwordInput, icon);
    });
  }
  
  // For register page
  const registerToggle = document.querySelector('#register-page #togglePassword');
  if (registerToggle) {
    registerToggle.addEventListener('click', function() {
      const passwordInput = document.querySelector('#register-page #password');
      const icon = this.querySelector('i');
      togglePasswordVisibility(passwordInput, icon);
    });
  }
  
  // Password validation for registration
  const registerForm = document.querySelector('form[action="/auth/register"]');
  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      
      if (password !== confirmPassword) {
        e.preventDefault();
        alert('Passwords do not match!');
      }
      
      if (password.length < 8) {
        e.preventDefault();
        alert('Password must be at least 8 characters long!');
      }
    });
  }
});

function togglePasswordVisibility(input, icon) {
  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.remove('fa-eye');
    icon.classList.add('fa-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
  }
}
