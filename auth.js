// Auth page functionality
document.addEventListener("DOMContentLoaded", () => {
    // Tab switching
    const tabBtns = document.querySelectorAll(".auth-tabs .tab-btn")
    const formContainers = document.querySelectorAll(".auth-form-container")

    tabBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            const targetTab = btn.dataset.tab

            // Update active tab
            tabBtns.forEach((tab) => tab.classList.remove("active"))
            btn.classList.add("active")

            // Show corresponding form
            formContainers.forEach((container) => {
                container.classList.add("hidden")
                if (container.id === `${targetTab}-form`) {
                    container.classList.remove("hidden")
                }
            })
        })
    })

    // Password visibility toggle
    window.togglePassword = (inputId) => {
        const input = document.getElementById(inputId)
        const toggle = input.nextElementSibling.querySelector("i")

        if (input.type === "password") {
            input.type = "text"
            toggle.classList.remove("fa-eye")
            toggle.classList.add("fa-eye-slash")
        } else {
            input.type = "password"
            toggle.classList.remove("fa-eye-slash")
            toggle.classList.add("fa-eye")
        }
    }

    // Password strength checker
    const passwordInput = document.getElementById("password")
    const strengthBar = document.querySelector(".strength-fill")
    const strengthText = document.querySelector(".strength-text")

    if (passwordInput) {
        passwordInput.addEventListener("input", function () {
            const password = this.value
            const strength = calculatePasswordStrength(password)

            updatePasswordStrength(strength)
        })
    }

    function calculatePasswordStrength(password) {
        let score = 0

        if (password.length >= 8) score += 25
        if (password.match(/[a-z]/)) score += 25
        if (password.match(/[A-Z]/)) score += 25
        if (password.match(/[0-9]/)) score += 25
        if (password.match(/[^a-zA-Z0-9]/)) score += 25

        return Math.min(score, 100)
    }

    function updatePasswordStrength(strength) {
        strengthBar.style.width = strength + "%"

        if (strength < 25) {
            strengthBar.style.background = "var(--accent-danger)"
            strengthText.textContent = "Weak password"
            strengthText.style.color = "var(--accent-danger)"
        } else if (strength < 50) {
            strengthBar.style.background = "var(--accent-warning)"
            strengthText.textContent = "Fair password"
            strengthText.style.color = "var(--accent-warning)"
        } else if (strength < 75) {
            strengthBar.style.background = "var(--neon-blue)"
            strengthText.textContent = "Good password"
            strengthText.style.color = "var(--neon-blue)"
        } else {
            strengthBar.style.background = "var(--accent-success)"
            strengthText.textContent = "Strong password"
            strengthText.style.color = "var(--accent-success)"
        }
    }

    // Form submissions
    const signupForm = document.getElementById("signupForm")
    const loginForm = document.getElementById("loginForm")

    if (signupForm) {
        signupForm.addEventListener("submit", function (e) {
            e.preventDefault()
            handleSignup(new FormData(this))
        })
    }

    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault()
            handleLogin(new FormData(this))
        })
    }

    function handleSignup(formData) {
        const password = formData.get("password")
        const confirmPassword = formData.get("confirmPassword")

        if (password !== confirmPassword) {
            showNotification("Passwords do not match", "error")
            return
        }

        if (!formData.get("terms")) {
            showNotification("Please accept the Terms of Service", "error")
            return
        }

        // Simulate API call
        showLoading()
        setTimeout(() => {
            hideLoading()
            window.showSuccessModal()
        }, 2000)
    }

    function handleLogin(formData) {
        const email = formData.get("email")
        const password = formData.get("password")

        if (!email || !password) {
            showNotification("Please fill in all fields", "error")
            return
        }

        // Simulate API call
        showLoading()
        setTimeout(() => {
            hideLoading()
            showNotification("Login successful! Redirecting...", "success")
            setTimeout(() => {
                window.location.href = "index.html"
            }, 1500)
        }, 2000)
    }

    // Social auth buttons
    const socialBtns = document.querySelectorAll(".social-btn")
    socialBtns.forEach((btn) => {
        btn.addEventListener("click", function () {
            const provider = this.classList.contains("google")
                ? "Google"
                : this.classList.contains("apple")
                    ? "Apple"
                    : "GitHub"
            showNotification(`${provider} authentication coming soon!`, "info")
        })
    })

    // Modal functions
    window.showSuccessModal = () => {
        const modal = document.getElementById("successModal")
        modal.classList.add("active")
    }

    window.closeModal = () => {
        const modal = document.getElementById("successModal")
        modal.classList.remove("active")
        setTimeout(() => {
            window.location.href = "index.html"
        }, 300)
    }

    // Loading functions
    function showLoading() {
        const submitBtns = document.querySelectorAll('button[type="submit"]')
        submitBtns.forEach((btn) => {
            btn.disabled = true
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Processing...</span>'
        })
    }

    function hideLoading() {
        const submitBtns = document.querySelectorAll('button[type="submit"]')
        submitBtns.forEach((btn) => {
            btn.disabled = false
            if (btn.closest("#signupForm")) {
                btn.innerHTML = '<i class="fas fa-rocket"></i><span>CREATE WALLET</span>'
            } else {
                btn.innerHTML = '<i class="fas fa-sign-in-alt"></i><span>LOGIN TO WALLET</span>'
            }
        })
    }

    // Notification system
    function showNotification(message, type = "info") {
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
            max-width: 300px;
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

    // Add ripple effect to buttons
    document.querySelectorAll(".btn-primary, .btn-secondary, .social-btn").forEach((button) => {
        button.addEventListener("click", function (e) {
            const ripple = document.createElement("span")
            const rect = this.getBoundingClientRect()
            const size = Math.max(rect.width, rect.height)
            const x = e.clientX - rect.left - size / 2
            const y = e.clientY - rect.top - size / 2

            ripple.style.width = ripple.style.height = size + "px"
            ripple.style.left = x + "px"
            ripple.style.top = y + "px"
            ripple.classList.add("ripple")

            this.appendChild(ripple)

            setTimeout(() => {
                ripple.remove()
            }, 600)
        })
    })

    // Add ripple effect CSS
    const rippleStyle = document.createElement("style")
    rippleStyle.textContent = `
        .btn-primary, .btn-secondary, .social-btn {
            position: relative;
            overflow: hidden;
        }
        
        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transform: scale(0);
            animation: ripple-animation 0.6s linear;
            pointer-events: none;
        }
        
        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `
    document.head.appendChild(rippleStyle)

    // Form validation styling
    const inputs = document.querySelectorAll("input")
    inputs.forEach((input) => {
        input.addEventListener("blur", function () {
            if (this.checkValidity()) {
                this.style.borderColor = "var(--accent-success)"
            } else {
                this.style.borderColor = "var(--accent-danger)"
            }
        })

        input.addEventListener("focus", function () {
            this.style.borderColor = "var(--accent-primary)"
        })
    })
})
