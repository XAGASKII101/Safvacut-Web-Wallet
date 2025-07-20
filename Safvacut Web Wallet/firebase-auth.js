// Firebase Authentication Handler
class SafvacutAuth {
    constructor() {
        this.auth = null
        this.providers = {}
        this.init()
    }

    async init() {
        // Wait for Firebase to be available
        while (!window.firebaseAuth) {
            await new Promise((resolve) => setTimeout(resolve, 100))
        }

        this.auth = window.firebaseAuth
        this.setupProviders()
        this.setupEventListeners()
        this.checkAuthState()
    }

    setupProviders() {
        // Google Provider
        this.providers.google = new window.GoogleAuthProvider()
        this.providers.google.addScope("profile")
        this.providers.google.addScope("email")

        // GitHub Provider
        this.providers.github = new window.GithubAuthProvider()
        this.providers.github.addScope("user:email")

        // Apple Provider
        this.providers.apple = new window.OAuthProvider("apple.com")
        this.providers.apple.addScope("email")
        this.providers.apple.addScope("name")
    }

    setupEventListeners() {
        // Social auth buttons
        document.querySelectorAll(".social-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                e.preventDefault()
                const provider = btn.dataset.provider
                this.signInWithProvider(provider)
            })
        })

        // Form submissions
        const signupForm = document.getElementById("signupForm")
        const loginForm = document.getElementById("loginForm")

        if (signupForm) {
            signupForm.addEventListener("submit", (e) => {
                e.preventDefault()
                this.handleEmailSignup(new FormData(signupForm))
            })
        }

        if (loginForm) {
            loginForm.addEventListener("submit", (e) => {
                e.preventDefault()
                this.handleEmailLogin(new FormData(loginForm))
            })
        }
    }

    async signInWithProvider(providerName) {
        try {
            this.showLoading(`Signing in with ${providerName}...`)

            const provider = this.providers[providerName]
            if (!provider) {
                throw new Error(`Provider ${providerName} not configured`)
            }

            const result = await window.signInWithPopup(this.auth, provider)
            const user = result.user

            // Get additional user info
            const credential = this.getCredentialFromResult(result, providerName)

            this.handleAuthSuccess(user, {
                provider: providerName,
                credential: credential,
                isNewUser: result._tokenResponse?.isNewUser || false,
            })
        } catch (error) {
            this.handleAuthError(error, providerName)
        } finally {
            this.hideLoading()
        }
    }

    getCredentialFromResult(result, providerName) {
        switch (providerName) {
            case "google":
                return window.GoogleAuthProvider.credentialFromResult(result)
            case "github":
                return window.GithubAuthProvider.credentialFromResult(result)
            case "apple":
                return window.OAuthProvider.credentialFromResult(result)
            default:
                return null
        }
    }

    async handleEmailSignup(formData) {
        try {
            const email = formData.get("email")
            const password = formData.get("password")
            const confirmPassword = formData.get("confirmPassword")
            const fullName = formData.get("fullName")
            const terms = formData.get("terms")

            // Validation
            if (!this.validateSignupForm(email, password, confirmPassword, fullName, terms)) {
                return
            }

            this.showLoading("Creating your account...")

            const userCredential = await window.createUserWithEmailAndPassword(this.auth, email, password)
            const user = userCredential.user

            // Update user profile
            await this.updateUserProfile(user, {
                displayName: fullName,
                photoURL: this.generateAvatarURL(fullName),
            })

            // Send email verification
            await this.sendEmailVerification(user)

            this.handleAuthSuccess(user, {
                provider: "email",
                isNewUser: true,
                needsEmailVerification: true,
            })
        } catch (error) {
            this.handleAuthError(error, "email-signup")
        } finally {
            this.hideLoading()
        }
    }

    async handleEmailLogin(formData) {
        try {
            const email = formData.get("email")
            const password = formData.get("password")
            const remember = formData.get("remember")

            if (!email || !password) {
                this.showNotification("Please fill in all fields", "error")
                return
            }

            this.showLoading("Signing you in...")

            const userCredential = await window.signInWithEmailAndPassword(this.auth, email, password)
            const user = userCredential.user

            // Handle remember me
            if (remember) {
                localStorage.setItem("safvacut_remember", "true")
            }

            this.handleAuthSuccess(user, {
                provider: "email",
                isNewUser: false,
            })
        } catch (error) {
            this.handleAuthError(error, "email-login")
        } finally {
            this.hideLoading()
        }
    }

    validateSignupForm(email, password, confirmPassword, fullName, terms) {
        if (!fullName || fullName.trim().length < 2) {
            this.showNotification("Please enter your full name", "error")
            return false
        }

        if (!email || !this.isValidEmail(email)) {
            this.showNotification("Please enter a valid email address", "error")
            return false
        }

        if (!password || password.length < 8) {
            this.showNotification("Password must be at least 8 characters long", "error")
            return false
        }

        if (password !== confirmPassword) {
            this.showNotification("Passwords do not match", "error")
            return false
        }

        if (!terms) {
            this.showNotification("Please accept the Terms of Service", "error")
            return false
        }

        return true
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    async updateUserProfile(user, profileData) {
        const { updateProfile } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js")
        await updateProfile(user, profileData)
    }

    async sendEmailVerification(user) {
        const { sendEmailVerification } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js")
        await sendEmailVerification(user)
    }

    generateAvatarURL(name) {
        const initials = name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=00ffff&color=000&size=200&font-size=0.6&format=png&rounded=true`
    }

    handleAuthSuccess(user, metadata = {}) {
        console.log("Authentication successful:", user)

        // Store user data
        const userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified,
            provider: metadata.provider,
            isNewUser: metadata.isNewUser,
            createdAt: user.metadata.creationTime,
            lastLoginAt: user.metadata.lastSignInTime,
        }

        localStorage.setItem("safvacut_user", JSON.stringify(userData))

        // Show success message
        if (metadata.isNewUser) {
            if (metadata.needsEmailVerification) {
                this.showEmailVerificationModal(user.email)
            } else {
                this.showWelcomeModal(user.displayName || user.email)
            }
        } else {
            this.showNotification(`Welcome back, ${user.displayName || user.email}!`, "success")
            setTimeout(() => {
                this.redirectToDashboard()
            }, 1500)
        }

        // Track analytics
        this.trackAuthEvent("login", {
            method: metadata.provider,
            is_new_user: metadata.isNewUser,
        })
    }

    handleAuthError(error, context) {
        console.error("Authentication error:", error)

        let message = "An error occurred during authentication"

        switch (error.code) {
            case "auth/user-not-found":
                message = "No account found with this email address"
                break
            case "auth/wrong-password":
                message = "Incorrect password"
                break
            case "auth/email-already-in-use":
                message = "An account with this email already exists"
                break
            case "auth/weak-password":
                message = "Password is too weak"
                break
            case "auth/invalid-email":
                message = "Invalid email address"
                break
            case "auth/user-disabled":
                message = "This account has been disabled"
                break
            case "auth/too-many-requests":
                message = "Too many failed attempts. Please try again later"
                break
            case "auth/popup-closed-by-user":
                message = "Sign-in was cancelled"
                break
            case "auth/popup-blocked":
                message = "Pop-up was blocked. Please allow pop-ups and try again"
                break
            case "auth/cancelled-popup-request":
                message = "Sign-in was cancelled"
                break
            case "auth/network-request-failed":
                message = "Network error. Please check your connection"
                break
            default:
                if (error.message) {
                    message = error.message
                }
        }

        this.showNotification(message, "error")

        // Track error
        this.trackAuthEvent("login_error", {
            error_code: error.code,
            context: context,
        })
    }

    checkAuthState() {
        this.auth.onAuthStateChanged((user) => {
            if (user) {
                console.log("User is signed in:", user)
                // Update UI for signed-in user
                this.updateUIForSignedInUser(user)
            } else {
                console.log("User is signed out")
                // Update UI for signed-out user
                this.updateUIForSignedOutUser()
            }
        })
    }

    updateUIForSignedInUser(user) {
        // Update any UI elements for signed-in state
        const loginBtn = document.querySelector(".login-btn")
        if (loginBtn) {
            loginBtn.innerHTML = `
        <img src="${user.photoURL || this.generateAvatarURL(user.displayName || user.email)}" 
             alt="Profile" style="width: 24px; height: 24px; border-radius: 50%; margin-right: 8px;">
        <span>${user.displayName || "Account"}</span>
      `
            loginBtn.href = "#"
            loginBtn.addEventListener("click", (e) => {
                e.preventDefault()
                this.showUserMenu()
            })
        }
    }

    updateUIForSignedOutUser() {
        // Reset UI for signed-out state
        const loginBtn = document.querySelector(".login-btn")
        if (loginBtn) {
            loginBtn.innerHTML = `
        <i class="fas fa-user"></i>
        <span>LOGIN</span>
      `
            loginBtn.href = "signup-login.html"
        }
    }

    showUserMenu() {
        // Show user dropdown menu
        const menu = document.createElement("div")
        menu.className = "user-menu"
        menu.innerHTML = `
      <div class="user-menu-content">
        <button onclick="safvacutAuth.redirectToDashboard()">
          <i class="fas fa-tachometer-alt"></i> Dashboard
        </button>
        <button onclick="safvacutAuth.showProfile()">
          <i class="fas fa-user"></i> Profile
        </button>
        <button onclick="safvacutAuth.showSettings()">
          <i class="fas fa-cog"></i> Settings
        </button>
        <hr>
        <button onclick="safvacutAuth.signOut()" class="sign-out">
          <i class="fas fa-sign-out-alt"></i> Sign Out
        </button>
      </div>
    `

        document.body.appendChild(menu)

        // Position menu
        const loginBtn = document.querySelector(".login-btn")
        const rect = loginBtn.getBoundingClientRect()
        menu.style.position = "fixed"
        menu.style.top = rect.bottom + 10 + "px"
        menu.style.right = "20px"
        menu.style.zIndex = "10000"

        // Close menu when clicking outside
        setTimeout(() => {
            document.addEventListener("click", function closeMenu(e) {
                if (!menu.contains(e.target)) {
                    menu.remove()
                    document.removeEventListener("click", closeMenu)
                }
            })
        }, 100)
    }

    async signOut() {
        try {
            await this.auth.signOut()
            localStorage.removeItem("safvacut_user")
            localStorage.removeItem("safvacut_remember")
            this.showNotification("Signed out successfully", "success")
            setTimeout(() => {
                window.location.href = "index.html"
            }, 1000)
        } catch (error) {
            console.error("Sign out error:", error)
            this.showNotification("Error signing out", "error")
        }
    }

    redirectToDashboard() {
        // Redirect to the new dashboard
        this.showNotification("Redirecting to dashboard...", "info")
        setTimeout(() => {
            window.location.href = "dashboard.html"
        }, 1000)
    }

    showProfile() {
        this.showNotification("Profile page coming soon!", "info")
    }

    showSettings() {
        this.showNotification("Settings page coming soon!", "info")
    }

    showWelcomeModal(name) {
        const modal = document.getElementById("successModal")
        const modalContent = modal.querySelector(".modal-content")

        modalContent.innerHTML = `
      <div class="success-icon">
        <i class="fas fa-check-circle"></i>
      </div>
      <h3>Welcome to Safvacut!</h3>
      <p>Your account has been created successfully, ${name}. You can now start securing your crypto assets.</p>
      <div class="modal-actions">
        <button class="btn-primary" onclick="safvacutAuth.closeModalAndRedirect()">
          <i class="fas fa-rocket"></i>
          <span>GET STARTED</span>
        </button>
      </div>
    `

        modal.classList.add("active")
    }

    showEmailVerificationModal(email) {
        const modal = document.getElementById("successModal")
        const modalContent = modal.querySelector(".modal-content")

        modalContent.innerHTML = `
      <div class="success-icon">
        <i class="fas fa-envelope-check"></i>
      </div>
      <h3>Verify Your Email</h3>
      <p>We've sent a verification email to <strong>${email}</strong>. Please check your inbox and click the verification link to complete your registration.</p>
      <div class="modal-actions">
        <button class="btn-primary" onclick="safvacutAuth.closeModalAndRedirect()">
          <i class="fas fa-check"></i>
          <span>GOT IT</span>
        </button>
      </div>
    `

        modal.classList.add("active")
    }

    closeModalAndRedirect() {
        const modal = document.getElementById("successModal")
        modal.classList.remove("active")
        setTimeout(() => {
            this.redirectToDashboard()
        }, 300)
    }

    showLoading(message = "Processing...") {
        const submitBtns = document.querySelectorAll('button[type="submit"], .social-btn')
        submitBtns.forEach((btn) => {
            btn.disabled = true
            if (btn.classList.contains("social-btn")) {
                btn.style.opacity = "0.6"
            } else {
                btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i><span>${message}</span>`
            }
        })
    }

    hideLoading() {
        const submitBtns = document.querySelectorAll('button[type="submit"], .social-btn')
        submitBtns.forEach((btn) => {
            btn.disabled = false
            if (btn.classList.contains("social-btn")) {
                btn.style.opacity = "1"
            } else {
                if (btn.closest("#signupForm")) {
                    btn.innerHTML = '<i class="fas fa-rocket"></i><span>CREATE WALLET</span>'
                } else if (btn.closest("#loginForm")) {
                    btn.innerHTML = '<i class="fas fa-sign-in-alt"></i><span>LOGIN TO WALLET</span>'
                }
            }
        })
    }

    showNotification(message, type = "info") {
        const notification = document.createElement("div")
        notification.className = `notification ${type}`

        const icon = type === "success" ? "fa-check-circle" : type === "error" ? "fa-exclamation-circle" : "fa-info-circle"

        notification.innerHTML = `
      <i class="fas ${icon}"></i>
      <span>${message}</span>
      <button class="close-btn" onclick="this.parentElement.remove()">
        <i class="fas fa-times"></i>
      </button>
    `

        // Add styles
        notification.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background: var(--bg-card);
      border: 1px solid var(--border-secondary);
      border-radius: 12px;
      padding: 1rem;
      color: var(--text-primary);
      box-shadow: var(--shadow-lg);
      z-index: 10000;
      display: flex;
      align-items: center;
      gap: 12px;
      max-width: 350px;
      animation: slideInRight 0.3s ease;
    `

        if (type === "success") {
            notification.style.borderColor = "var(--accent-success)"
        } else if (type === "error") {
            notification.style.borderColor = "var(--accent-danger)"
        }

        document.body.appendChild(notification)

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove()
            }
        }, 5000)
    }

    trackAuthEvent(eventName, parameters = {}) {
        // Track authentication events for analytics
        if (window.gtag) {
            window.gtag("event", eventName, parameters)
        }
        console.log("Auth Event:", eventName, parameters)
    }
}

// Initialize authentication when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    window.safvacutAuth = new SafvacutAuth()
})

// Add user menu styles
const userMenuStyles = document.createElement("style")
userMenuStyles.textContent = `
  .user-menu {
    background: var(--bg-card);
    border: 1px solid var(--border-secondary);
    border-radius: 12px;
    box-shadow: var(--shadow-xl);
    min-width: 200px;
    animation: slideInDown 0.3s ease;
  }

  .user-menu-content {
    padding: 0.5rem;
  }

  .user-menu button {
    width: 100%;
    background: none;
    border: none;
    color: var(--text-primary);
    padding: 0.75rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
  }

  .user-menu button:hover {
    background: var(--bg-secondary);
  }

  .user-menu button.sign-out {
    color: var(--accent-danger);
  }

  .user-menu button.sign-out:hover {
    background: rgba(255, 71, 87, 0.1);
  }

  .user-menu hr {
    border: none;
    border-top: 1px solid var(--border-secondary);
    margin: 0.5rem 0;
  }

  @keyframes slideInDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`
document.head.appendChild(userMenuStyles)
