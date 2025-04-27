// Register and Login Handler using LocalStorage

document.addEventListener("DOMContentLoaded", () => {
    populateDateFields();
  
    // --- Registration Logic ---
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
      registerForm.addEventListener("submit", function (e) {
        e.preventDefault();
  
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const firstName = document.getElementById("firstName").value.trim();
        const lastName = document.getElementById("lastName").value.trim();
        const email = document.getElementById("email").value.trim();
        const message = document.getElementById("registerMessage");
  
        if (!username || !password || !confirmPassword || !firstName || !lastName || !email) {
          message.textContent = "Please fill in all fields.";
          return;
        }
  
        if (!/^(?=.*[a-zA-Z])(?=.*\d).{8,}$/.test(password)) {
          message.textContent = "Password must be at least 8 characters and include letters and numbers.";
          return;
        }
  
        if (password !== confirmPassword) {
          message.textContent = "Passwords do not match.";
          return;
        }
  
        if (/\d/.test(firstName) || /\d/.test(lastName)) {
          message.textContent = "First and last names cannot contain numbers.";
          return;
        }
  
        if (!/^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.(com|co\.il|org|net|gov\.il|edu|me)$/.test(email)) {
          message.textContent = "Please enter a valid email address (must start with a letter and use a valid domain).";
          return;
        }
  
        const newUser = { username, password };
        let users = JSON.parse(localStorage.getItem("users")) || [];
  
        if (users.some(u => u.username === username)) {
          message.textContent = "Username already exists.";
          message.style.color = "salmon";
          return;
        }
  
        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));
  
        message.style.color = "lightgreen";
        message.textContent = "Registration successful! You can now login.";
      });
    }
  
    // --- Login Logic ---
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
      loginForm.addEventListener("submit", function (e) {
        e.preventDefault();
  
        const username = document.getElementById("loginUsername").value.trim();
        const password = document.getElementById("loginPassword").value;
        const message = document.getElementById("loginMessage");
  
        let users = JSON.parse(localStorage.getItem("users")) || [];
        users.push({ username: "p", password: "testuser" }); // default user
  
        const foundUser = users.find(user => user.username === username && user.password === password);
  
        if (foundUser) {
          message.style.color = "lightgreen";
          message.textContent = "Login successful!";
          localStorage.setItem("currentUser", username);
          // Remove all old scores of other users
          for (let key in localStorage) {
            if (key.startsWith("scores_") && key !== `scores_${username}`) {
              localStorage.removeItem(key);
            }
          }
          setTimeout(() => {
            window.location.href = "config.html";
          }, 1000);
        } else {
          message.style.color = "salmon";
          message.textContent = "Invalid username or password.";
        }
      });
    }
  });
  
  // Populate birth date dropdowns
  function populateDateFields() {
    const daySelect = document.getElementById("day");
    const monthSelect = document.getElementById("month");
    const yearSelect = document.getElementById("year");
  
    if (!daySelect || !monthSelect || !yearSelect) return;
  
    for (let d = 1; d <= 31; d++) {
      daySelect.innerHTML += `<option value="${d}">${d}</option>`;
    }
  
    for (let m = 1; m <= 12; m++) {
      monthSelect.innerHTML += `<option value="${m}">${m}</option>`;
    }
  
    const currentYear = new Date().getFullYear();
    for (let y = currentYear; y >= 1900; y--) {
      yearSelect.innerHTML += `<option value="${y}">${y}</option>`;
    }
  }
  
  