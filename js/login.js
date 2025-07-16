// login.js
// Modern login logic for role selection and admin authentication

const loginContainer = document.getElementById('loginContainer');
const adminBtn = document.getElementById('adminBtn');
const clientBtn = document.getElementById('clientBtn');
const employeeBtn = document.getElementById('employeeBtn');

// Popup for under maintenance
const showMaintenanceAlert = () => {
  alert("This section is under maintenance.");
};

clientBtn.addEventListener('click', showMaintenanceAlert);
employeeBtn.addEventListener('click', showMaintenanceAlert);

adminBtn.addEventListener('click', () => {
  // Replace the container content with login form
  loginContainer.innerHTML = `
    <h2>Admin Login</h2>
    <input type="text" id="username" placeholder="Username" />
    <input type="password" id="password" placeholder="Password" />
    <label style="margin-top: 0.5rem;">
      <input type="checkbox" id="rememberMe" /> Remember Me
    </label>
    <button class="login-btn" id="loginBtn">Login</button>
  `;

  // Delay attaching event listener to new login button
  setTimeout(() => {
    const loginBtn = document.getElementById('loginBtn');
    loginBtn.addEventListener('click', async () => {
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const rememberMe = document.getElementById('rememberMe').checked;

      // PocketBase Auth
      try {
        // Dynamically import PocketBase SDK
        const module = await import('https://cdn.jsdelivr.net/npm/pocketbase-sdk');
        const PocketBase = module.default || module;
        const pb = new PocketBase('http://127.0.0.1:8090');
        const authData = await pb.collection('users').authWithPassword(username, password);

        // ✅ Store credentials in localStorage if Remember Me checked
        if (rememberMe) {
          const expiry = new Date().getTime() + 7 * 24 * 60 * 60 * 1000; // 7 days
          localStorage.setItem('rememberedCredentials', JSON.stringify({
            username,
            password,
            expiry
          }));
        }

        // ✅ Redirect to dashboard
        window.location.href = 'admin-dashboard.html';
      } catch (error) {
        alert("Login failed. Please check your credentials.");
        console.error(error);
      }
    });

    // Autofill if remembered
    const stored = localStorage.getItem('rememberedCredentials');
    if (stored) {
      const { username, password, expiry } = JSON.parse(stored);
      if (new Date().getTime() < expiry) {
        document.getElementById('username').value = username;
        document.getElementById('password').value = password;
        document.getElementById('rememberMe').checked = true;
      } else {
        localStorage.removeItem('rememberedCredentials');
      }
    }
  }, 50);
}); 