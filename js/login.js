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

function renderRoleButtons() {
  loginContainer.innerHTML = `
    <h2>Select Role</h2>
    <button class="role-btn" id="adminBtn">Admin</button>
    <button class="role-btn" id="clientBtn">Client</button>
    <button class="role-btn" id="employeeBtn">Employee</button>
  `;
  // Re-attach event listeners
  document.getElementById('adminBtn').addEventListener('click', showAdminLoginForm);
  document.getElementById('clientBtn').addEventListener('click', showMaintenanceAlert);
  document.getElementById('employeeBtn').addEventListener('click', showMaintenanceAlert);
}

function showAdminLoginForm() {
  loginContainer.innerHTML = `
    <div style="display:flex;align-items:center;gap:0.5rem;justify-content:center;margin-bottom:1rem;">
      <button id="backToRoles" style="background:none;border:none;color:var(--clr-primary);font-size:1.2rem;cursor:pointer;padding:0 0.5rem 0 0;">&#8592;</button>
      <h2 style="margin:0;">Admin Login</h2>
    </div>
    <input type="text" id="username" placeholder="Username" />
    <input type="password" id="password" placeholder="Password" />
    <label style="margin-top: 0.5rem;">
      <input type="checkbox" id="rememberMe" /> Remember Me
    </label>
    <button class="login-btn" id="loginBtn">Login</button>
  `;
  document.getElementById('backToRoles').addEventListener('click', renderRoleButtons);
  // Autofill if remembered
  setTimeout(() => {
    const loginBtn = document.getElementById('loginBtn');
    loginBtn.addEventListener('click', async () => {
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const rememberMe = document.getElementById('rememberMe').checked;
      // PocketBase Auth
      try {
        const module = await import('https://esm.sh/pocketbase');
        const PocketBase = module.default;
        const pb = new PocketBase('https://paperfree.bigbeetle.net/');
        const authData = await pb.collection('users').authWithPassword(username, password);
        if (rememberMe) {
          const expiry = new Date().getTime() + 7 * 24 * 60 * 60 * 1000;
          localStorage.setItem('rememberedCredentials', JSON.stringify({ username, password, expiry }));
        }
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
}

adminBtn.addEventListener('click', showAdminLoginForm); 