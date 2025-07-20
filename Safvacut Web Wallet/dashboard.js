// Dashboard functionality with complete Firestore integration
class SafvacutDashboard {
    constructor() {
        this.user = null
        this.userProfile = null
        this.wallets = []
        this.assets = []
        this.transactions = []
        this.notifications = []
        this.currentSection = "overview"
        this.init()
    }

    async init() {
        // Wait for Firebase to be available
        while (!window.firebaseAuth) {
            await new Promise((resolve) => setTimeout(resolve, 100))
        }

        this.setupEventListeners()
        this.checkAuthState()
        this.initializeCryptoData()
    }

    checkAuthState() {
        window.onAuthStateChanged(window.firebaseAuth, (user) => {
            if (user) {
                this.user = user
                this.updateUserInterface()
                this.loadUserProfile()
                this.loadNotifications()
            } else {
                // Redirect to login if not authenticated
                window.location.href = "signup-login.html"
            }
        })
    }

    setupEventListeners() {
        // Menu navigation
        document.querySelectorAll(".menu-item").forEach((item) => {
            item.addEventListener("click", () => {
                const section = item.dataset.section
                this.switchSection(section)
            })
        })

        // Password strength indicator
        const passwordInput = document.getElementById("newPassword")
        if (passwordInput) {
            passwordInput.addEventListener("input", this.updatePasswordStrength)
        }

        // PIN input formatting
        const pinInputs = document.querySelectorAll("#newPin, #confirmPin")
        pinInputs.forEach((input) => {
            input.addEventListener("input", (e) => {
                e.target.value = e.target.value.replace(/\D/g, "").substring(0, 6)
            })
        })
    }

    switchSection(section) {
        // Update menu
        document.querySelectorAll(".menu-item").forEach((item) => {
            item.classList.remove("active")
        })
        document.querySelector(`[data-section="${section}"]`).classList.add("active")

        // Update content
        document.querySelectorAll(".content-section").forEach((section) => {
            section.classList.remove("active")
        })
        document.getElementById(section).classList.add("active")

        this.currentSection = section
        this.loadSectionData(section)
    }

    loadSectionData(section) {
        switch (section) {
            case "overview":
                this.updatePortfolioOverview()
                break
            case "wallet":
                this.updateWalletSection()
                break
            case "transactions":
                this.loadTransactions()
                break
            case "profile":
                this.updateProfileSection()
                break
            case "settings":
                this.updateSettingsSection()
                break
        }
    }

    updateUserInterface() {
        if (!this.user) return

        // Update user avatar and name
        const userAvatar = document.getElementById("userAvatar")
        const userName = document.getElementById("userName")
        const profileAvatar = document.getElementById("profileAvatar")

        const avatarUrl = this.user.photoURL || this.generateAvatarURL(this.user.displayName || this.user.email)

        if (userAvatar) {
            userAvatar.src = avatarUrl
        }
        if (userName) {
            userName.textContent = this.user.displayName || this.user.email.split("@")[0]
        }
        if (profileAvatar) {
            profileAvatar.src = avatarUrl
        }
    }

    generateAvatarURL(name) {
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4F46E5&color=fff&size=200&font-size=0.6&format=png&rounded=true`
    }

    async loadUserProfile() {
        try {
            const userDoc = await window.firestoreGetDoc(window.firestoreDoc(window.firebaseDb, "users", this.user.uid))

            if (userDoc.exists()) {
                this.userProfile = userDoc.data()
                this.updateProfileData(this.userProfile)
                this.loadUserAssets()
                this.loadUserWallets()
            } else {
                // Create user profile if it doesn't exist
                await this.createUserProfile()
            }
        } catch (error) {
            console.error("Error loading user profile:", error)
            this.showNotification("Error loading profile data", "error")
        }
    }

    async createUserProfile() {
        try {
            // Get user's IP address
            let ipAddress = "Unknown"
            try {
                const ipResponse = await fetch("https://api.ipify.org?format=json")
                const ipData = await ipResponse.json()
                ipAddress = ipData.ip
            } catch (error) {
                console.log("Could not fetch IP address")
            }

            const userAgent = navigator.userAgent
            const walletId = this.generateWalletId()

            const profileData = {
                uid: this.user.uid,
                displayName: this.user.displayName || "",
                email: this.user.email,
                photoURL: this.user.photoURL || "",
                phoneNumber: "",
                country: "",
                ipAddress: ipAddress,
                device: userAgent,
                walletId: walletId,
                totalBalance: 0,
                dailyIncome: 0,
                dailyExpense: 0,
                totalTransactions: 0,
                emailVerified: this.user.emailVerified,
                registrationDate: new Date().toISOString(),
                lastLoginDate: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }

            await window.firestoreSetDoc(window.firestoreDoc(window.firebaseDb, "users", this.user.uid), profileData)

            // Create initial assets
            await this.createInitialAssets()

            // Create initial settings
            await this.createInitialSettings()

            this.userProfile = profileData
            this.updateProfileData(profileData)
            this.showNotification("Profile created successfully!", "success")
        } catch (error) {
            console.error("Error creating user profile:", error)
            this.showNotification("Error creating profile", "error")
        }
    }

    async createInitialAssets() {
        const initialAssets = [
            {
                userId: this.user.uid,
                symbol: "BTC",
                name: "Bitcoin",
                balance: 0,
                value: 0,
                price: 117853.0,
                change: 0.16,
                address: this.generateAddress("BTC"),
                createdAt: new Date().toISOString(),
            },
            {
                userId: this.user.uid,
                symbol: "ETH",
                name: "Ethereum",
                balance: 0,
                value: 0,
                price: 3582.22,
                change: 1.42,
                address: this.generateAddress("ETH"),
                createdAt: new Date().toISOString(),
            },
            {
                userId: this.user.uid,
                symbol: "BNB",
                name: "Binance Coin",
                balance: 0,
                value: 0,
                price: 732.49,
                change: 0.48,
                address: this.generateAddress("BNB"),
                createdAt: new Date().toISOString(),
            },
            {
                userId: this.user.uid,
                symbol: "USDT",
                name: "Tether",
                balance: 0,
                value: 0,
                price: 1.0,
                change: -0.02,
                address: this.generateAddress("USDT"),
                createdAt: new Date().toISOString(),
            },
            {
                userId: this.user.uid,
                symbol: "TRX",
                name: "TRON",
                balance: 0,
                value: 0,
                price: 0.32,
                change: -2.05,
                address: this.generateAddress("TRX"),
                createdAt: new Date().toISOString(),
            },
        ]

        // Add each asset to Firestore
        for (const asset of initialAssets) {
            await window.firestoreAddDoc(window.firestoreCollection(window.firebaseDb, "assets"), asset)
        }
    }

    async createInitialSettings() {
        const settingsData = {
            userId: this.user.uid,
            notifications: {
                email: true,
                push: true,
                transactions: true,
                priceAlerts: true,
            },
            security: {
                twoFactorEnabled: false,
                transactionPin: "",
                loginAlerts: true,
            },
            preferences: {
                currency: "USD",
                language: "en",
                theme: "dark",
            },
            updatedAt: new Date().toISOString(),
        }

        await window.firestoreSetDoc(window.firestoreDoc(window.firebaseDb, "settings", this.user.uid), settingsData)
    }

    async loadUserAssets() {
        try {
            const assetsQuery = window.firestoreQuery(
                window.firestoreCollection(window.firebaseDb, "assets"),
                window.firestoreWhere("userId", "==", this.user.uid),
            )

            const querySnapshot = await window.firestoreGetDocs(assetsQuery)
            this.assets = []

            querySnapshot.forEach((doc) => {
                this.assets.push({ id: doc.id, ...doc.data() })
            })

            this.updateAssetsDisplay()
        } catch (error) {
            console.error("Error loading user assets:", error)
            this.showNotification("Error loading assets", "error")
        }
    }

    async loadUserWallets() {
        try {
            const walletsQuery = window.firestoreQuery(
                window.firestoreCollection(window.firebaseDb, "wallets"),
                window.firestoreWhere("userId", "==", this.user.uid),
            )

            const querySnapshot = await window.firestoreGetDocs(walletsQuery)
            this.wallets = []

            querySnapshot.forEach((doc) => {
                this.wallets.push({ id: doc.id, ...doc.data() })
            })

            this.updateWalletSection()
        } catch (error) {
            console.error("Error loading user wallets:", error)
            this.showNotification("Error loading wallets", "error")
        }
    }

    async loadTransactions() {
        try {
            const transactionsQuery = window.firestoreQuery(
                window.firestoreCollection(window.firebaseDb, "transactions"),
                window.firestoreWhere("userId", "==", this.user.uid),
                window.firestoreOrderBy("createdAt", "desc"),
                window.firestoreLimit(10),
            )

            const querySnapshot = await window.firestoreGetDocs(transactionsQuery)
            this.transactions = []

            querySnapshot.forEach((doc) => {
                this.transactions.push({ id: doc.id, ...doc.data() })
            })

            this.updateTransactionsDisplay()
        } catch (error) {
            console.error("Error loading transactions:", error)
            this.showNotification("Error loading transactions", "error")
        }
    }

    async loadNotifications() {
        try {
            const notificationsQuery = window.firestoreQuery(
                window.firestoreCollection(window.firebaseDb, "notifications"),
                window.firestoreWhere("userId", "==", this.user.uid),
                window.firestoreOrderBy("createdAt", "desc"),
                window.firestoreLimit(20),
            )

            const querySnapshot = await window.firestoreGetDocs(notificationsQuery)
            this.notifications = []

            querySnapshot.forEach((doc) => {
                this.notifications.push({ id: doc.id, ...doc.data() })
            })

            this.updateNotificationCount()
        } catch (error) {
            console.error("Error loading notifications:", error)
        }
    }

    updateNotificationCount() {
        const unreadCount = this.notifications.filter((n) => !n.isRead).length
        const badge = document.getElementById("notificationCount")
        if (badge) {
            badge.textContent = unreadCount.toString()
            badge.style.display = unreadCount > 0 ? "block" : "none"
        }
    }

    generateWalletId() {
        return Math.floor(Math.random() * 9000000000) + 1000000000
    }

    updateProfileData(userData) {
        // Update profile section
        document.getElementById("profileName").textContent = userData.displayName || "Not provided"
        document.getElementById("profileEmail").textContent = userData.email || "Not provided"
        document.getElementById("detailName").textContent = userData.displayName || "Not provided"
        document.getElementById("detailEmail").textContent = userData.email || "Not provided"
        document.getElementById("detailPhone").textContent = userData.phoneNumber || "Not provided"
        document.getElementById("detailCountry").textContent = userData.country || "Not provided"
        document.getElementById("detailIP").textContent = userData.ipAddress || "Loading..."
        document.getElementById("detailDevice").textContent = this.formatDevice(userData.device) || "Loading..."
        document.getElementById("detailRegistration").textContent =
            this.formatDate(userData.registrationDate) || "Loading..."
        document.getElementById("memberSince").textContent = this.formatDate(userData.registrationDate) || "Loading..."
        document.getElementById("totalTransactions").textContent = userData.totalTransactions || "0"

        // Update wallet ID
        if (userData.walletId) {
            document.getElementById("walletId").textContent = userData.walletId
        }

        // Update balance data
        document.getElementById("totalBalance").textContent = (userData.totalBalance || 0).toFixed(2)
        document.getElementById("dailyIncome").textContent = "$" + (userData.dailyIncome || 0).toFixed(2)
        document.getElementById("dailyExpense").textContent = "$" + (userData.dailyExpense || 0).toFixed(2)
    }

    formatDevice(userAgent) {
        if (!userAgent) return "Unknown"

        if (userAgent.includes("Windows NT 10.0")) return "WINDOWS NT 10.0; WIN64; X64"
        if (userAgent.includes("Mac OS X")) return "MAC OS X"
        if (userAgent.includes("Linux")) return "LINUX"
        if (userAgent.includes("Android")) return "ANDROID"
        if (userAgent.includes("iPhone")) return "IPHONE"

        return "Unknown Device"
    }

    formatDate(dateString) {
        if (!dateString) return "Unknown"

        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        })
    }

    initializeCryptoData() {
        // This will be loaded from Firestore instead
        this.updateAssetsDisplay()
    }

    generateAddress(symbol) {
        const prefixes = {
            BTC: "1",
            ETH: "0x",
            BNB: "0x",
            USDT: "0x",
            TRX: "T",
        }

        const prefix = prefixes[symbol] || "0x"
        const length = symbol === "BTC" ? 34 : symbol === "TRX" ? 34 : 42
        const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
        let address = prefix

        for (let i = prefix.length; i < length; i++) {
            address += chars.charAt(Math.floor(Math.random() * chars.length))
        }

        return address
    }

    updateAssetsDisplay() {
        const assetsGrid = document.getElementById("assetsGrid")
        if (!assetsGrid) return

        assetsGrid.innerHTML = ""

        if (this.assets.length === 0) {
            assetsGrid.innerHTML = `
        <div class="no-assets">
          <i class="fas fa-coins"></i>
          <p>No assets found</p>
          <span>Your crypto assets will appear here</span>
        </div>
      `
            return
        }

        this.assets.forEach((asset) => {
            const assetCard = document.createElement("div")
            assetCard.className = "asset-card"
            assetCard.innerHTML = `
        <div class="asset-header">
          <img src="https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=40&h=40&fit=crop" alt="${asset.name}" class="asset-icon">
          <div class="asset-info">
            <h4>${asset.name}</h4>
            <span class="asset-symbol">${asset.symbol}</span>
          </div>
        </div>
        <div class="asset-balance">
          <div>
            <div class="asset-amount">${asset.balance.toFixed(8)} ${asset.symbol}</div>
            <div class="asset-value">$${asset.value.toFixed(2)}</div>
          </div>
          <div class="asset-change ${asset.change >= 0 ? "positive" : "negative"}">
            ${asset.change >= 0 ? "+" : ""}${asset.change.toFixed(2)}%
          </div>
        </div>
      `
            assetsGrid.appendChild(assetCard)
        })
    }

    updatePortfolioOverview() {
        // Update balance cards with current data
        const totalBalance = this.assets.reduce((sum, asset) => sum + asset.value, 0)
        document.getElementById("totalBalance").textContent = totalBalance.toFixed(2)

        // Simulate daily changes
        const dailyChange = totalBalance * 0.02 // 2% daily change simulation
        const dailyChangeElement = document.getElementById("dailyChange")
        const dailyChangePercentElement = document.getElementById("dailyChangePercent")

        if (dailyChangeElement) {
            dailyChangeElement.textContent = `+$${dailyChange.toFixed(2)}`
        }
        if (dailyChangePercentElement) {
            dailyChangePercentElement.textContent = `(+2.00%)`
        }
    }

    updateWalletSection() {
        const walletList = document.getElementById("walletList")
        const walletCount = document.getElementById("walletCount")

        if (this.wallets.length === 0) {
            walletList.innerHTML = `
        <div class="no-wallets">
          <i class="fas fa-wallet"></i>
          <p>No wallets connected</p>
          <button class="btn-primary" onclick="dashboard.showConnectWallet()">Connect Wallet</button>
        </div>
      `
            walletCount.textContent = "0"
        } else {
            walletCount.textContent = this.wallets.length.toString()
            // Display connected wallets
            walletList.innerHTML = ""
            this.wallets.forEach((wallet) => {
                const walletItem = document.createElement("div")
                walletItem.className = "wallet-item"
                walletItem.innerHTML = `
          <div class="wallet-info">
            <h4>${wallet.type}</h4>
            <p>${wallet.address.substring(0, 10)}...${wallet.address.substring(wallet.address.length - 8)}</p>
          </div>
          <div class="wallet-balance">
            <span>$${wallet.balance.toFixed(2)}</span>
          </div>
        `
                walletList.appendChild(walletItem)
            })
        }
    }

    updateTransactionsDisplay() {
        const transactionsList = document.getElementById("transactionsList")
        const activitiesList = document.getElementById("activitiesList")

        const displayElement = transactionsList || activitiesList

        if (this.transactions.length === 0) {
            displayElement.innerHTML = `
        <div class="no-transactions">
          <i class="fas fa-receipt"></i>
          <p>No transactions found</p>
          <span>Your transaction history will appear here</span>
        </div>
      `
        } else {
            displayElement.innerHTML = ""
            this.transactions.forEach((transaction) => {
                const transactionItem = document.createElement("div")
                transactionItem.className = "transaction-item"
                transactionItem.innerHTML = `
          <div class="transaction-info">
            <h4>${transaction.type.toUpperCase()} ${transaction.crypto}</h4>
            <p>${this.formatDate(transaction.createdAt)}</p>
          </div>
          <div class="transaction-amount ${transaction.type === "send" ? "negative" : "positive"}">
            ${transaction.type === "send" ? "-" : "+"}${transaction.amount} ${transaction.crypto}
          </div>
        `
                displayElement.appendChild(transactionItem)
            })
        }
    }

    // Profile Management Functions
    editProfile() {
        // Populate form with current data
        document.getElementById("editDisplayName").value = this.userProfile?.displayName || ""
        document.getElementById("editPhoneNumber").value = this.userProfile?.phoneNumber || ""
        document.getElementById("editCountry").value = this.userProfile?.country || ""

        document.getElementById("editProfileModal").classList.add("active")
    }

    async saveProfile(event) {
        event.preventDefault()

        try {
            const displayName = document.getElementById("editDisplayName").value
            const phoneNumber = document.getElementById("editPhoneNumber").value
            const country = document.getElementById("editCountry").value

            // Update Firebase Auth profile
            await window.updateProfile(this.user, {
                displayName: displayName,
            })

            // Update Firestore profile
            await window.firestoreUpdateDoc(window.firestoreDoc(window.firebaseDb, "users", this.user.uid), {
                displayName: displayName,
                phoneNumber: phoneNumber,
                country: country,
                updatedAt: new Date().toISOString(),
            })

            // Update local data
            this.userProfile.displayName = displayName
            this.userProfile.phoneNumber = phoneNumber
            this.userProfile.country = country

            this.updateProfileData(this.userProfile)
            this.updateUserInterface()
            this.closeModal("editProfileModal")
            this.showNotification("Profile updated successfully!", "success")
        } catch (error) {
            console.error("Error updating profile:", error)
            this.showNotification("Error updating profile", "error")
        }
    }

    changeAvatar() {
        document.getElementById("avatarInput").click()
    }

    async handleAvatarUpload(event) {
        const file = event.target.files[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith("image/")) {
            this.showNotification("Please select an image file", "error")
            return
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            this.showNotification("Image size must be less than 5MB", "error")
            return
        }

        try {
            this.showNotification("Uploading avatar...", "info")

            // Upload to Firebase Storage
            const storageRef = window.storageRef(window.firebaseStorage, `avatars/${this.user.uid}`)
            await window.uploadBytes(storageRef, file)
            const downloadURL = await window.getDownloadURL(storageRef)

            // Update Firebase Auth profile
            await window.updateProfile(this.user, {
                photoURL: downloadURL,
            })

            // Update Firestore profile
            await window.firestoreUpdateDoc(window.firestoreDoc(window.firebaseDb, "users", this.user.uid), {
                photoURL: downloadURL,
                updatedAt: new Date().toISOString(),
            })

            // Update local data
            this.userProfile.photoURL = downloadURL
            this.updateUserInterface()
            this.showNotification("Avatar updated successfully!", "success")
        } catch (error) {
            console.error("Error uploading avatar:", error)
            this.showNotification("Error uploading avatar", "error")
        }
    }

    // Password Management
    showChangePassword() {
        document.getElementById("changePasswordModal").classList.add("active")
    }

    async changePassword(event) {
        event.preventDefault()

        const currentPassword = document.getElementById("currentPassword").value
        const newPassword = document.getElementById("newPassword").value
        const confirmPassword = document.getElementById("confirmNewPassword").value

        if (newPassword !== confirmPassword) {
            this.showNotification("New passwords do not match", "error")
            return
        }

        if (newPassword.length < 8) {
            this.showNotification("Password must be at least 8 characters long", "error")
            return
        }

        try {
            // Re-authenticate user
            const credential = window.EmailAuthProvider.credential(this.user.email, currentPassword)
            await window.reauthenticateWithCredential(this.user, credential)

            // Update password
            await window.updatePassword(this.user, newPassword)

            this.closeModal("changePasswordModal")
            this.showNotification("Password changed successfully!", "success")

            // Clear form
            document.getElementById("currentPassword").value = ""
            document.getElementById("newPassword").value = ""
            document.getElementById("confirmNewPassword").value = ""
        } catch (error) {
            console.error("Error changing password:", error)
            if (error.code === "auth/wrong-password") {
                this.showNotification("Current password is incorrect", "error")
            } else {
                this.showNotification("Error changing password", "error")
            }
        }
    }

    updatePasswordStrength(event) {
        const password = event.target.value
        const strengthBar = document.querySelector(".strength-fill")
        const strengthText = document.querySelector(".strength-text")

        let strength = 0
        let text = "Weak"
        let color = "#ef4444"

        if (password.length >= 8) strength += 25
        if (/[a-z]/.test(password)) strength += 25
        if (/[A-Z]/.test(password)) strength += 25
        if (/[0-9]/.test(password)) strength += 25

        if (strength >= 75) {
            text = "Strong"
            color = "#10b981"
        } else if (strength >= 50) {
            text = "Medium"
            color = "#f59e0b"
        }

        if (strengthBar) {
            strengthBar.style.width = `${strength}%`
            strengthBar.style.background = color
        }
        if (strengthText) {
            strengthText.textContent = text
        }
    }

    // PIN Management
    showChangePin() {
        document.getElementById("changePinModal").classList.add("active")
    }

    async changePin(event) {
        event.preventDefault()

        const newPin = document.getElementById("newPin").value
        const confirmPin = document.getElementById("confirmPin").value

        if (newPin !== confirmPin) {
            this.showNotification("PINs do not match", "error")
            return
        }

        if (newPin.length !== 6) {
            this.showNotification("PIN must be exactly 6 digits", "error")
            return
        }

        try {
            // Hash the PIN before storing (in production, use proper encryption)
            const hashedPin = btoa(newPin) // Simple base64 encoding for demo

            // Update settings in Firestore
            await window.firestoreUpdateDoc(window.firestoreDoc(window.firebaseDb, "settings", this.user.uid), {
                "security.transactionPin": hashedPin,
                updatedAt: new Date().toISOString(),
            })

            this.closeModal("changePinModal")
            this.showNotification("Transaction PIN set successfully!", "success")

            // Clear form
            document.getElementById("newPin").value = ""
            document.getElementById("confirmPin").value = ""
        } catch (error) {
            console.error("Error setting PIN:", error)
            this.showNotification("Error setting PIN", "error")
        }
    }

    // Notification Management
    showNotifications() {
        this.displayNotifications()
        document.getElementById("notificationsModal").classList.add("active")
    }

    displayNotifications() {
        const notificationsList = document.getElementById("notificationsList")

        if (this.notifications.length === 0) {
            notificationsList.innerHTML = `
        <div class="no-notifications">
          <i class="fas fa-bell-slash"></i>
          <p>No notifications</p>
          <span>You're all caught up!</span>
        </div>
      `
        } else {
            notificationsList.innerHTML = ""
            this.notifications.forEach((notification) => {
                const notificationItem = document.createElement("div")
                notificationItem.className = `notification-item ${notification.isRead ? "read" : "unread"}`
                notificationItem.innerHTML = `
          <div class="notification-icon ${notification.type}">
            <i class="fas ${this.getNotificationIcon(notification.type)}"></i>
          </div>
          <div class="notification-content">
            <h4>${notification.title}</h4>
            <p>${notification.message}</p>
            <span class="notification-time">${this.formatDate(notification.createdAt)}</span>
          </div>
          ${!notification.isRead
                        ? `<button class="mark-read-btn" onclick="dashboard.markNotificationRead('${notification.id}')">
            <i class="fas fa-check"></i>
          </button>`
                        : ""
                    }
        `
                notificationsList.appendChild(notificationItem)
            })
        }
    }

    getNotificationIcon(type) {
        switch (type) {
            case "success":
                return "fa-check-circle"
            case "warning":
                return "fa-exclamation-triangle"
            case "error":
                return "fa-exclamation-circle"
            default:
                return "fa-info-circle"
        }
    }

    async markNotificationRead(notificationId) {
        try {
            await window.firestoreUpdateDoc(window.firestoreDoc(window.firebaseDb, "notifications", notificationId), {
                isRead: true,
            })

            // Update local data
            const notification = this.notifications.find((n) => n.id === notificationId)
            if (notification) {
                notification.isRead = true
            }

            this.updateNotificationCount()
            this.displayNotifications()
        } catch (error) {
            console.error("Error marking notification as read:", error)
        }
    }

    async createNotification(title, message, type = "info") {
        try {
            const notification = {
                userId: this.user.uid,
                title: title,
                message: message,
                type: type,
                isRead: false,
                createdAt: new Date().toISOString(),
            }

            await window.firestoreAddDoc(window.firestoreCollection(window.firebaseDb, "notifications"), notification)
            this.loadNotifications() // Refresh notifications
        } catch (error) {
            console.error("Error creating notification:", error)
        }
    }

    // Notification Settings
    showNotificationSettings() {
        this.loadNotificationSettings()
        document.getElementById("notificationSettingsModal").classList.add("active")
    }

    async loadNotificationSettings() {
        try {
            const settingsDoc = await window.firestoreGetDoc(
                window.firestoreDoc(window.firebaseDb, "settings", this.user.uid),
            )

            if (settingsDoc.exists()) {
                const settings = settingsDoc.data()

                document.getElementById("emailNotifications").checked = settings.notifications?.email ?? true
                document.getElementById("priceAlerts").checked = settings.notifications?.priceAlerts ?? true
                document.getElementById("loginAlerts").checked = settings.security?.loginAlerts ?? true
                document.getElementById("securityAlerts").checked = settings.notifications?.transactions ?? true
            }
        } catch (error) {
            console.error("Error loading notification settings:", error)
        }
    }

    async saveNotificationSettings(event) {
        event.preventDefault()

        try {
            const settings = {
                notifications: {
                    email: document.getElementById("emailNotifications").checked,
                    priceAlerts: document.getElementById("priceAlerts").checked,
                    transactions: document.getElementById("securityAlerts").checked,
                },
                security: {
                    loginAlerts: document.getElementById("loginAlerts").checked,
                },
                updatedAt: new Date().toISOString(),
            }

            await window.firestoreUpdateDoc(window.firestoreDoc(window.firebaseDb, "settings", this.user.uid), settings)

            this.closeModal("notificationSettingsModal")
            this.showNotification("Notification settings saved!", "success")
        } catch (error) {
            console.error("Error saving notification settings:", error)
            this.showNotification("Error saving settings", "error")
        }
    }

    // Modal functions
    showConnectWallet() {
        document.getElementById("connectWalletModal").classList.add("active")
    }

    showImportMnemonic() {
        this.closeModal("connectWalletModal")
        document.getElementById("importMnemonicModal").classList.add("active")
    }

    showSend() {
        document.getElementById("sendModal").classList.add("active")
    }

    showReceive() {
        document.getElementById("receiveModal").classList.add("active")
        this.updateReceiveAddress()
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove("active")
    }

    // Wallet connection functions
    async connectMetaMask() {
        try {
            if (typeof window.ethereum !== "undefined") {
                const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
                if (accounts.length > 0) {
                    await this.addWallet("MetaMask", accounts[0])
                    this.showNotification("MetaMask connected successfully!", "success")
                    this.closeModal("connectWalletModal")
                }
            } else {
                this.showNotification("MetaMask not detected. Please install MetaMask extension.", "error")
            }
        } catch (error) {
            console.error("MetaMask connection error:", error)
            this.showNotification("Failed to connect MetaMask", "error")
        }
    }

    connectWalletConnect() {
        this.showNotification("WalletConnect integration coming soon!", "info")
    }

    async importWallet() {
        const mnemonicPhrase = document.getElementById("mnemonicPhrase").value.trim()

        if (!mnemonicPhrase) {
            this.showNotification("Please enter your mnemonic phrase", "error")
            return
        }

        const words = mnemonicPhrase.split(" ").filter((word) => word.length > 0)
        if (words.length !== 12 && words.length !== 24) {
            this.showNotification("Mnemonic phrase must be 12 or 24 words", "error")
            return
        }

        try {
            // Simulate wallet import (in real implementation, use proper crypto libraries)
            const walletAddress = this.generateAddress("ETH")
            await this.addWallet("Imported Wallet", walletAddress)
            this.showNotification("Wallet imported successfully!", "success")
            this.closeModal("importMnemonicModal")
            document.getElementById("mnemonicPhrase").value = ""
        } catch (error) {
            console.error("Wallet import error:", error)
            this.showNotification("Failed to import wallet", "error")
        }
    }

    async addWallet(type, address) {
        try {
            const wallet = {
                userId: this.user.uid,
                type: type,
                address: address,
                balance: 0,
                isActive: true,
                createdAt: new Date().toISOString(),
                lastUsed: new Date().toISOString(),
            }

            const docRef = await window.firestoreAddDoc(window.firestoreCollection(window.firebaseDb, "wallets"), wallet)
            wallet.id = docRef.id
            this.wallets.push(wallet)
            this.updateWalletSection()

            // Create notification
            await this.createNotification("Wallet Connected", `${type} wallet connected successfully`, "success")

            // Update user's wallet count
            await this.updateUserStats()
        } catch (error) {
            console.error("Error adding wallet:", error)
            this.showNotification("Error adding wallet", "error")
        }
    }

    async updateUserStats() {
        try {
            await window.firestoreUpdateDoc(window.firestoreDoc(window.firebaseDb, "users", this.user.uid), {
                totalWallets: this.wallets.length,
                updatedAt: new Date().toISOString(),
            })
        } catch (error) {
            console.error("Error updating user stats:", error)
        }
    }

    // Transaction functions
    updateSendCurrency() {
        const crypto = document.getElementById("sendCrypto").value
        document.getElementById("sendCurrencyLabel").textContent = crypto
    }

    async handleSendTransaction(event) {
        event.preventDefault()

        const crypto = document.getElementById("sendCrypto").value
        const recipientAddress = document.getElementById("recipientAddress").value
        const amount = Number.parseFloat(document.getElementById("sendAmount").value)

        if (!recipientAddress || !amount || amount <= 0) {
            this.showNotification("Please fill in all fields correctly", "error")
            return
        }

        // Find the asset
        const asset = this.assets.find((a) => a.symbol === crypto)
        if (!asset || asset.balance < amount) {
            this.showNotification("Insufficient balance", "error")
            return
        }

        try {
            // Create transaction record
            const transaction = {
                userId: this.user.uid,
                type: "send",
                crypto: crypto,
                amount: amount,
                recipient: recipientAddress,
                status: "completed",
                fee: amount * 0.001, // 0.1% fee simulation
                hash: this.generateTransactionHash(),
                createdAt: new Date().toISOString(),
                confirmedAt: new Date().toISOString(),
            }

            await window.firestoreAddDoc(window.firestoreCollection(window.firebaseDb, "transactions"), transaction)

            // Update asset balance (in real implementation, this would be handled by blockchain)
            asset.balance -= amount
            asset.value = asset.balance * asset.price

            // Update asset in Firestore
            await window.firestoreUpdateDoc(window.firestoreDoc(window.firebaseDb, "assets", asset.id), {
                balance: asset.balance,
                value: asset.value,
                updatedAt: new Date().toISOString(),
            })

            this.updateAssetsDisplay()
            this.showNotification("Transaction submitted successfully!", "success")
            this.closeModal("sendModal")

            // Create notification
            await this.createNotification("Transaction Sent", `${amount} ${crypto} sent successfully`, "success")

            // Clear form
            document.getElementById("recipientAddress").value = ""
            document.getElementById("sendAmount").value = ""

            // Update user transaction count
            await this.updateUserTransactionCount()
        } catch (error) {
            console.error("Transaction error:", error)
            this.showNotification("Transaction failed", "error")
        }
    }

    generateTransactionHash() {
        return "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")
    }

    async updateUserTransactionCount() {
        try {
            const newCount = (this.userProfile.totalTransactions || 0) + 1
            await window.firestoreUpdateDoc(window.firestoreDoc(window.firebaseDb, "users", this.user.uid), {
                totalTransactions: newCount,
                updatedAt: new Date().toISOString(),
            })
            this.userProfile.totalTransactions = newCount
            document.getElementById("totalTransactions").textContent = newCount.toString()
        } catch (error) {
            console.error("Error updating transaction count:", error)
        }
    }

    updateReceiveAddress() {
        const crypto = document.getElementById("receiveCrypto").value
        const asset = this.assets.find((a) => a.symbol === crypto)

        if (asset) {
            document.getElementById("walletAddress").value = asset.address
            document.getElementById("selectedCrypto").textContent = asset.name

            // Generate QR code (simplified)
            const qrCode = document.getElementById("qrCode")
            qrCode.innerHTML = `<i class="fas fa-qrcode"></i>`
            // In real implementation, use a QR code library
        }
    }

    copyAddress() {
        const addressInput = document.getElementById("walletAddress")
        addressInput.select()
        navigator.clipboard
            .writeText(addressInput.value)
            .then(() => {
                this.showNotification("Address copied to clipboard!", "success")
            })
            .catch(() => {
                document.execCommand("copy")
                this.showNotification("Address copied to clipboard!", "success")
            })
    }

    copyWalletId() {
        const walletId = document.getElementById("walletId").textContent
        navigator.clipboard
            .writeText(walletId)
            .then(() => {
                this.showNotification("Wallet ID copied to clipboard!", "success")
            })
            .catch(() => {
                this.showNotification("Failed to copy wallet ID", "error")
            })
    }

    // Settings functions
    show2FA() {
        this.showNotification("Two-Factor Authentication setup coming soon!", "info")
    }

    showPrivacySettings() {
        this.showNotification("Privacy settings coming soon!", "info")
    }

    confirmLogout() {
        if (confirm("Are you sure you want to logout?")) {
            this.logout()
        }
    }

    async logout() {
        try {
            await window.firebaseAuth.signOut()
            localStorage.removeItem("safvacut_user")
            this.showNotification("Logged out successfully", "success")
            setTimeout(() => {
                window.location.href = "index.html"
            }, 1000)
        } catch (error) {
            console.error("Logout error:", error)
            this.showNotification("Error logging out", "error")
        }
    }

    // Utility functions
    refreshPortfolio() {
        this.showNotification("Portfolio refreshed!", "success")
        this.loadUserProfile()
        this.updatePortfolioOverview()
    }

    refreshTransactions() {
        this.showNotification("Transactions refreshed!", "success")
        this.loadTransactions()
    }

    showSettings() {
        this.switchSection("settings")
    }

    showUserMenu() {
        // User menu functionality
        this.showNotification("User menu coming soon!", "info")
    }

    showAllAssets() {
        this.showNotification("Full assets view coming soon!", "info")
    }

    showAllActivities() {
        this.showNotification("Full activities view coming soon!", "info")
    }

    showCreateWallet() {
        this.showNotification("Create wallet functionality coming soon!", "info")
    }

    showImportWallet() {
        this.showImportMnemonic()
    }

    showSell() {
        this.showNotification("Sell functionality coming soon!", "info")
    }

    showStaking() {
        this.showNotification("Staking functionality coming soon!", "info")
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

        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove()
            }
        }, 5000)
    }
}

// Global functions for onclick handlers
window.dashboard = null

// Initialize dashboard when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    window.dashboard = new SafvacutDashboard()
})

// Global functions
window.showConnectWallet = () => window.dashboard?.showConnectWallet()
window.showImportMnemonic = () => window.dashboard?.showImportMnemonic()
window.showSend = () => window.dashboard?.showSend()
window.showReceive = () => window.dashboard?.showReceive()
window.closeModal = (modalId) => window.dashboard?.closeModal(modalId)
window.connectMetaMask = () => window.dashboard?.connectMetaMask()
window.connectWalletConnect = () => window.dashboard?.connectWalletConnect()
window.importWallet = () => window.dashboard?.importWallet()
window.updateReceiveAddress = () => window.dashboard?.updateReceiveAddress()
window.updateSendCurrency = () => window.dashboard?.updateSendCurrency()
window.handleSendTransaction = (event) => window.dashboard?.handleSendTransaction(event)
window.copyAddress = () => window.dashboard?.copyAddress()
window.copyWalletId = () => window.dashboard?.copyWalletId()
window.refreshPortfolio = () => window.dashboard?.refreshPortfolio()
window.refreshTransactions = () => window.dashboard?.refreshTransactions()
window.showNotifications = () => window.dashboard?.showNotifications()
window.showSettings = () => window.dashboard?.showSettings()
window.showUserMenu = () => window.dashboard?.showUserMenu()
window.editProfile = () => window.dashboard?.editProfile()
window.saveProfile = (event) => window.dashboard?.saveProfile(event)
window.changeAvatar = () => window.dashboard?.changeAvatar()
window.handleAvatarUpload = (event) => window.dashboard?.handleAvatarUpload(event)
window.showChangePassword = () => window.dashboard?.showChangePassword()
window.changePassword = (event) => window.dashboard?.changePassword(event)
window.showChangePin = () => window.dashboard?.showChangePin()
window.changePin = (event) => window.dashboard?.changePin(event)
window.showNotificationSettings = () => window.dashboard?.showNotificationSettings()
window.saveNotificationSettings = (event) => window.dashboard?.saveNotificationSettings(event)
window.markNotificationRead = (id) => window.dashboard?.markNotificationRead(id)
window.showAllAssets = () => window.dashboard?.showAllAssets()
window.showAllActivities = () => window.dashboard?.showAllActivities()
window.showCreateWallet = () => window.dashboard?.showCreateWallet()
window.showImportWallet = () => window.dashboard?.showImportWallet()
window.showSell = () => window.dashboard?.showSell()
window.showStaking = () => window.dashboard?.showStaking()
window.show2FA = () => window.dashboard?.show2FA()
window.showPrivacySettings = () => window.dashboard?.showPrivacySettings()
window.confirmLogout = () => window.dashboard?.confirmLogout()
