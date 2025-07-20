// login.js (ES module)
import PocketBase from "https://esm.sh/pocketbase";

const pb = new PocketBase("https://paperfree.bigbeetle.net/");

const loginContainer = document.getElementById("loginContainer");
const adminBtn = document.getElementById("adminBtn");
const clientBtn = document.getElementById("clientBtn");
const employeeBtn = document.getElementById("employeeBtn");

const showMaintenanceAlert = () => alert("This section is under maintenance.");

clientBtn.addEventListener("click", showMaintenanceAlert);
employeeBtn.addEventListener("click", showMaintenanceAlert);

function renderRoleButtons() {
  loginContainer.innerHTML = `
    <h2>Select Role</h2>
    <button class="role-btn" id="adminBtn">Admin</button>
    <button class="role-btn" id="clientBtn">Client</button>
    <button class="role-btn" id="employeeBtn">Employee</button>
  `;

  document
    .getElementById("adminBtn")
    .addEventListener("click", showAdminLoginForm);
  document
    .getElementById("clientBtn")
    .addEventListener("click", showMaintenanceAlert);
  document
    .getElementById("employeeBtn")
    .addEventListener("click", showMaintenanceAlert);
}

function showAdminLoginForm() {
  loginContainer.innerHTML = `
    <form id="loginForm" autocomplete="on">
      <div style="display:flex;align-items:center;gap:0.5rem;justify-content:center;margin-bottom:1rem;">
        <button id="backToRoles" style="background:none;border:none;color:var(--clr-primary);font-size:1.2rem;cursor:pointer;padding:0 0.5rem 0 0;">&#8592;</button>
        <h2 style="margin:0;">Admin Login</h2>
      </div>
      <input type="text" id="username" placeholder="Username" required />
      <div style="position:relative;width:100%;">
        <input type="password" id="password" placeholder="Password" style="padding-right:2.5rem;width:100%;" required/>
        <span id="togglePassword" style="position:absolute;right:0.75rem;top:50%;transform:translateY(-50%);cursor:pointer;user-select:none;">
          <svg id="eyeIcon" xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
          </svg>
        </span>
      </div>
      <label style="margin-top: 0.5rem;">
        <input type="checkbox" id="rememberMe" /> Remember Me
      </label>
      <button type="submit" class="login-btn" id="loginBtn">Login</button>
    </form>
  `;

  document
    .getElementById("backToRoles")
    .addEventListener("click", renderRoleButtons);

  // Password visibility toggle
  const passwordInput = document.getElementById("password");
  const togglePassword = document.getElementById("togglePassword");
  let passwordVisible = false;
  togglePassword.addEventListener("click", () => {
    passwordVisible = !passwordVisible;
    passwordInput.type = passwordVisible ? "text" : "password";
    document.getElementById("eyeIcon").innerHTML = passwordVisible
      ? `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.042-3.292m3.087-2.727A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.973 9.973 0 01-4.293 5.411M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3l18 18"/>`
      : `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>`;
  });

  // Restore previous auth if token exists
  const savedToken =
    localStorage.getItem("pb_token") || sessionStorage.getItem("pb_token");
  const savedModel =
    localStorage.getItem("pb_model") || sessionStorage.getItem("pb_model");
  if (savedToken && savedModel) {
    pb.authStore.save(savedToken, JSON.parse(savedModel));
  }

  // ✅ Redirect if already authenticated
  if (pb.authStore.isValid) {
    window.location.href = "admin-dashboard.html";
  }

  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = e.target.username.value;
    const password = e.target.password.value;
    const rememberMe = document.getElementById("rememberMe").checked;

    try {
      const authData = await pb
        .collection("users")
        .authWithPassword(email, password);

      if (rememberMe) {
        localStorage.setItem("pb_token", pb.authStore.token);
        localStorage.setItem("pb_model", JSON.stringify(pb.authStore.model));
      } else {
        sessionStorage.setItem("pb_token", pb.authStore.token);
        sessionStorage.setItem("pb_model", JSON.stringify(pb.authStore.model));
      }

      window.location.href = "admin-dashboard.html";
    } catch (err) {
      alert("Login failed: " + err.message);
    }
  });
}

adminBtn.addEventListener("click", showAdminLoginForm);
