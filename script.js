// Mobile Navigation Toggle
const hamburger = document.querySelector(".hamburger")
const navMenu = document.querySelector(".nav-menu")

hamburger?.addEventListener("click", () => {
    hamburger.classList.toggle("active")
    navMenu?.classList.toggle("active")
})

// Close mobile menu when clicking on a link
document.querySelectorAll(".nav-menu a").forEach((link) => {
    link.addEventListener("click", () => {
        hamburger?.classList.remove("active")
        navMenu?.classList.remove("active")
    })
})

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
        e.preventDefault()
        const target = document.querySelector(this.getAttribute("href"))
        if (target) {
            target.scrollIntoView({
                behavior: "smooth",
                block: "start",
            })
        }
    })
})

// Navbar background on scroll
window.addEventListener("scroll", () => {
    const navbar = document.querySelector(".navbar")
    if (window.scrollY > 100) {
        navbar.style.background = "rgba(10, 10, 15, 0.98)"
        navbar.style.borderBottom = "1px solid rgba(0, 212, 255, 0.2)"
    } else {
        navbar.style.background = "rgba(10, 10, 15, 0.95)"
        navbar.style.borderBottom = "1px solid var(--border-primary)"
    }
})

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
}

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("loaded")
        }
    })
}, observerOptions)

// Observe all animatable elements
document
    .querySelectorAll(".feature-card, .advanced-card, .asset-card, .testimonial-card, .security-card, .news-card")
    .forEach((el) => {
        el.classList.add("loading")
        observer.observe(el)
    })

// Counter animation for statistics
function animateCounter(element, target, duration = 2000) {
    let start = 0
    const increment = target / (duration / 16)

    const timer = setInterval(() => {
        start += increment
        element.textContent = Math.floor(start)

        if (start >= target) {
            element.textContent = target
            clearInterval(timer)
        }
    }, 16)
}

// Animate counters when they come into view
const statValues = document.querySelectorAll(".stat-value")
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            const target = entry.target
            const text = target.textContent

            if (text.includes("$2.4B+")) {
                target.textContent = "$2.4B+"
            } else if (text.includes("5M+")) {
                target.textContent = "5M+"
            } else if (text === "90+") {
                animateCounter(target, 90)
                setTimeout(() => {
                    target.textContent = "90+"
                }, 2000)
            } else if (text === "113") {
                animateCounter(target, 113)
            }

            statsObserver.unobserve(target)
        }
    })
})

statValues.forEach((stat) => {
    statsObserver.observe(stat)
})

// Portfolio value animation
const portfolioValues = document.querySelectorAll(".portfolio-stat .stat-value")
const portfolioObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            const target = entry.target
            const text = target.textContent

            if (text.includes("$93,214.33")) {
                animatePortfolioValue(target, 93214.33)
            } else if (text.includes("+$82,323.11")) {
                animatePortfolioValue(target, 82323.11, "+$")
            }

            portfolioObserver.unobserve(target)
        }
    })
})

function animatePortfolioValue(element, target, prefix = "$") {
    let start = 0
    const increment = target / 100

    const timer = setInterval(() => {
        start += increment
        element.textContent =
            prefix +
            start.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })

        if (start >= target) {
            element.textContent =
                prefix +
                target.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                })
            clearInterval(timer)
        }
    }, 20)
}

portfolioValues.forEach((value) => {
    portfolioObserver.observe(value)
})

// Crypto price ticker animation
function animateTicker() {
    const ticker = document.querySelector(".ticker-wrapper")
    if (ticker) {
        ticker.style.animation = "none"
        ticker.offsetHeight // Trigger reflow
        ticker.style.animation = "scroll 30s linear infinite"
    }
}

// Restart ticker animation every 30 seconds
setInterval(animateTicker, 30000)

// Button click effects with ripple
document.querySelectorAll(".btn-primary, .btn-secondary, .download-btn").forEach((button) => {
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
    .btn-primary, .btn-secondary, .download-btn {
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

// Parallax effect for floating elements
window.addEventListener("scroll", () => {
    const scrolled = window.pageYOffset
    const parallaxElements = document.querySelectorAll(".floating-elements")

    parallaxElements.forEach((element) => {
        const speed = 0.3
        element.style.transform = `translateY(${scrolled * speed}px)`
    })
})

// Crypto symbols floating animation
function createFloatingSymbols() {
    const symbols = ["₿", "Ξ", "◎", "⬢", "₳", "◆", "●", "▲"]
    const hero = document.querySelector(".hero-background")

    symbols.forEach((symbol, index) => {
        const span = document.createElement("span")
        span.textContent = symbol
        span.className = "floating-symbol"
        span.style.cssText = `
      position: absolute;
      font-size: ${Math.random() * 2 + 1}rem;
      color: rgba(0, 212, 255, ${Math.random() * 0.3 + 0.1});
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      animation: floatSymbol ${Math.random() * 10 + 10}s linear infinite;
      animation-delay: ${index * 2}s;
      pointer-events: none;
    `
        hero?.appendChild(span)
    })
}

// Add floating symbols animation CSS
const floatingStyle = document.createElement("style")
floatingStyle.textContent = `
  @keyframes floatSymbol {
    0% {
      transform: translateY(100vh) rotate(0deg);
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    90% {
      opacity: 1;
    }
    100% {
      transform: translateY(-100vh) rotate(360deg);
      opacity: 0;
    }
  }
`
document.head.appendChild(floatingStyle)

// Initialize floating symbols
createFloatingSymbols()

// Loading animation for the page
window.addEventListener("load", () => {
    document.body.classList.add("loaded")

    // Animate elements on load with stagger
    setTimeout(() => {
        document.querySelectorAll(".loading").forEach((el, index) => {
            setTimeout(() => {
                el.classList.add("loaded")
            }, index * 100)
        })
    }, 500)

    // Loading Screen
    const loadingScreen = document.querySelector(".loading-screen")
    setTimeout(() => {
        loadingScreen.style.opacity = "0"
        setTimeout(() => {
            loadingScreen.style.display = "none"
        }, 500)
    }, 3000)
})

// Asset card hover effects
document.querySelectorAll(".asset-card").forEach((card) => {
    card.addEventListener("mouseenter", () => {
        card.style.transform = "translateY(-5px) scale(1.02)"
        card.style.boxShadow = "var(--shadow-glow)"
    })

    card.addEventListener("mouseleave", () => {
        card.style.transform = "translateY(0) scale(1)"
        card.style.boxShadow = "var(--shadow-lg)"
    })
})

// Feature card interactions with glow effect
const featureCards = document.querySelectorAll(".feature-card")

featureCards.forEach((card) => {
    card.addEventListener("click", () => {
        const feature = card.dataset.feature
        showFeatureDetails(feature)
    })
})

function showFeatureDetails(feature) {
    const features = {
        trading: "Advanced Trading: Professional tools with 0.1s execution and 0.05% fees",
        staking: "Staking Rewards: Earn up to 25% APY with flexible terms",
        defi: "DeFi Integration: Access 500+ protocols with auto-compound features",
        nft: "NFT Marketplace: Zero gas fees on Layer 2 with multi-chain support",
        security: "Military Security: AES-256 encryption with biometric authentication",
        analytics: "AI Analytics: AI-powered insights with auto-rebalancing",
    }

    showNotification(features[feature], "info")
}

// Bottom Navigation
const navItems = document.querySelectorAll(".nav-item")
const sections = document.querySelectorAll("section")

navItems.forEach((item) => {
    item.addEventListener("click", () => {
        const targetSection = item.dataset.section
        const section = document.getElementById(targetSection)

        if (section) {
            section.scrollIntoView({ behavior: "smooth" })

            // Update active nav item
            navItems.forEach((nav) => nav.classList.remove("active"))
            item.classList.add("active")
        }
    })
})

// Scroll spy for navigation
window.addEventListener("scroll", () => {
    let current = ""

    sections.forEach((section) => {
        const sectionTop = section.offsetTop
        const sectionHeight = section.clientHeight

        if (window.scrollY >= sectionTop - 200) {
            current = section.getAttribute("id")
        }
    })

    navItems.forEach((item) => {
        item.classList.remove("active")
        if (item.dataset.section === current) {
            item.classList.add("active")
        }
    })
})

// Floating Action Button
const fab = document.querySelector(".fab")
const fabBtn = document.querySelector(".fab-btn")
const fabItems = document.querySelectorAll(".fab-item")

fabBtn.addEventListener("click", () => {
    fab.classList.toggle("active")
})

// Close FAB when clicking outside
document.addEventListener("click", (e) => {
    if (!fab.contains(e.target)) {
        fab.classList.remove("active")
    }
})

// FAB item actions
fabItems.forEach((item) => {
    item.addEventListener("click", () => {
        const action = item.dataset.action
        handleFabAction(action)
        fab.classList.remove("active")
    })
})

// Update FAB item actions to include signup redirect
function handleFabAction(action) {
    switch (action) {
        case "signup":
            window.location.href = "signup-login.html"
            break
        case "buy":
            showNotification("Buy Crypto feature coming soon!", "info")
            break
        case "send":
            showNotification("Send feature coming soon!", "info")
            break
        case "receive":
            showNotification("Receive feature coming soon!", "info")
            break
        case "swap":
            showNotification("Swap feature coming soon!", "info")
            break
    }
}

// Asset Category Tabs
const tabBtns = document.querySelectorAll(".tab-btn")
const assetsGrid = document.querySelector(".assets-grid")

tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        tabBtns.forEach((tab) => tab.classList.remove("active"))
        btn.classList.add("active")

        const category = btn.dataset.category
        loadAssetCategory(category)
    })
})

function loadAssetCategory(category) {
    // Simulate loading different asset categories
    const assets = {
        popular: [
            { name: "Bitcoin", symbol: "BTC", price: "$118,288.00", change: "-0.9%", trending: true },
            { name: "Ethereum", symbol: "ETH", price: "$3,575.71", change: "+1.8%" },
            { name: "Binance Coin", symbol: "BNB", price: "$733.28", change: "+2.1%" },
            { name: "Solana", symbol: "SOL", price: "$177.12", change: "+5.2%" },
            { name: "Cardano", symbol: "ADA", price: "$0.827", change: "-4.0%" },
            { name: "Polygon", symbol: "MATIC", price: "$0.89", change: "+3.4%" },
        ],
        defi: [
            { name: "Uniswap", symbol: "UNI", price: "$12.45", change: "+8.2%" },
            { name: "Aave", symbol: "AAVE", price: "$89.32", change: "+5.7%" },
            { name: "Compound", symbol: "COMP", price: "$45.67", change: "-2.1%" },
            { name: "SushiSwap", symbol: "SUSHI", price: "$1.23", change: "+12.4%" },
            { name: "Curve", symbol: "CRV", price: "$0.78", change: "+3.9%" },
            { name: "Yearn Finance", symbol: "YFI", price: "$8,234.56", change: "+7.8%" },
        ],
        layer1: [
            { name: "Ethereum", symbol: "ETH", price: "$3,575.71", change: "+1.8%" },
            { name: "Solana", symbol: "SOL", price: "$177.12", change: "+5.2%" },
            { name: "Cardano", symbol: "ADA", price: "$0.827", change: "-4.0%" },
            { name: "Avalanche", symbol: "AVAX", price: "$34.56", change: "+6.3%" },
            { name: "Polkadot", symbol: "DOT", price: "$7.89", change: "-1.2%" },
            { name: "Cosmos", symbol: "ATOM", price: "$12.34", change: "+4.5%" },
        ],
        meme: [
            { name: "Dogecoin", symbol: "DOGE", price: "$0.089", change: "+15.6%" },
            { name: "Shiba Inu", symbol: "SHIB", price: "$0.000012", change: "+23.4%" },
            { name: "Pepe", symbol: "PEPE", price: "$0.0000089", change: "+45.7%" },
            { name: "Floki", symbol: "FLOKI", price: "$0.000034", change: "+12.8%" },
            { name: "Baby Doge", symbol: "BABYDOGE", price: "$0.0000000012", change: "+67.9%" },
            { name: "SafeMoon", symbol: "SAFEMOON", price: "$0.00034", change: "-8.2%" },
        ],
    }

    // Update assets grid with animation
    assetsGrid.style.opacity = "0"
    setTimeout(() => {
        assetsGrid.innerHTML = ""
        assets[category].forEach((asset) => {
            const assetCard = createAssetCard(asset)
            assetsGrid.appendChild(assetCard)
        })
        assetsGrid.style.opacity = "1"
    }, 200)
}

function createAssetCard(asset) {
    const card = document.createElement("div")
    card.className = `asset-card ${asset.trending ? "trending" : ""}`

    const changeClass = asset.change.startsWith("+") ? "positive" : "negative"
    const changeIcon = asset.change.startsWith("+") ? "fa-arrow-up" : "fa-arrow-down"

    card.innerHTML = `
    <div class="asset-header">
      <img src="https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=40&h=40&fit=crop" alt="${asset.name}">
      <div class="asset-info">
        <span class="asset-name">${asset.name}</span>
        <span class="asset-symbol">${asset.symbol}</span>
      </div>
      ${asset.trending ? '<div class="trending-badge"><i class="fas fa-fire"></i></div>' : ""}
    </div>
    <div class="asset-price">${asset.price}</div>
    <div class="asset-change ${changeClass}">
      <i class="fas ${changeIcon}"></i>
      ${asset.change}
    </div>
    <div class="asset-chart">
      <canvas class="mini-chart" data-symbol="${asset.symbol}"></canvas>
    </div>
  `

    return card
}

// Testimonials Slider
let currentTestimonial = 0
const testimonialCards = document.querySelectorAll(".testimonial-card")
const testimonialDots = document.querySelectorAll(".dot")
const prevBtn = document.querySelector(".control-btn.prev")
const nextBtn = document.querySelector(".control-btn.next")

function showTestimonial(index) {
    testimonialCards.forEach((card) => card.classList.remove("active"))
    testimonialDots.forEach((dot) => dot.classList.remove("active"))

    testimonialCards[index].classList.add("active")
    testimonialDots[index].classList.add("active")
}

function nextTestimonial() {
    currentTestimonial = (currentTestimonial + 1) % testimonialCards.length
    showTestimonial(currentTestimonial)
}

function prevTestimonial() {
    currentTestimonial = (currentTestimonial - 1 + testimonialCards.length) % testimonialCards.length
    showTestimonial(currentTestimonial)
}

nextBtn.addEventListener("click", nextTestimonial)
prevBtn.addEventListener("click", prevTestimonial)

testimonialDots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
        currentTestimonial = index
        showTestimonial(currentTestimonial)
    })
})

// Auto-rotate testimonials
setInterval(nextTestimonial, 5000)

// Particle System
function createParticle() {
    const particle = document.createElement("div")
    particle.className = "particle"
    particle.style.left = Math.random() * 100 + "%"
    particle.style.animationDelay = Math.random() * 6 + "s"
    particle.style.animationDuration = Math.random() * 3 + 3 + "s"

    document.querySelector(".crypto-particles").appendChild(particle)

    setTimeout(() => {
        particle.remove()
    }, 6000)
}

// Create particles periodically
setInterval(createParticle, 500)

// Mini chart generation
function generateMiniChart(canvas, symbol) {
    const ctx = canvas.getContext("2d")
    const width = (canvas.width = canvas.offsetWidth)
    const height = (canvas.height = canvas.offsetHeight)

    // Generate random data points
    const points = []
    for (let i = 0; i < 20; i++) {
        points.push(Math.random() * height)
    }

    // Draw chart line
    ctx.strokeStyle = symbol.includes("BTC") || symbol.includes("ETH") ? "#00ffff" : "#8a2be2"
    ctx.lineWidth = 2
    ctx.beginPath()

    points.forEach((point, index) => {
        const x = (index / (points.length - 1)) * width
        if (index === 0) {
            ctx.moveTo(x, point)
        } else {
            ctx.lineTo(x, point)
        }
    })

    ctx.stroke()
}

// Initialize mini charts
document.querySelectorAll(".mini-chart").forEach((canvas) => {
    const symbol = canvas.dataset.symbol
    generateMiniChart(canvas, symbol)
})

// Portfolio Chart (using Chart.js would be better, but this is a simple version)
const portfolioChart = document.getElementById("portfolioChart")
if (portfolioChart) {
    const ctx = portfolioChart.getContext("2d")

    // Simple chart drawing
    function drawPortfolioChart() {
        const width = (portfolioChart.width = portfolioChart.offsetWidth)
        const height = (portfolioChart.height = portfolioChart.offsetHeight)

        // Generate sample data
        const data = []
        for (let i = 0; i < 30; i++) {
            data.push(50000 + Math.random() * 80000)
        }

        // Draw gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, height)
        gradient.addColorStop(0, "rgba(0, 255, 255, 0.3)")
        gradient.addColorStop(1, "rgba(0, 255, 255, 0.05)")

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.moveTo(0, height)

        data.forEach((value, index) => {
            const x = (index / (data.length - 1)) * width
            const y = height - ((value - 50000) / 80000) * height

            if (index === 0) {
                ctx.lineTo(x, y)
            } else {
                ctx.lineTo(x, y)
            }
        })

        ctx.lineTo(width, height)
        ctx.closePath()
        ctx.fill()

        // Draw line
        ctx.strokeStyle = "#00ffff"
        ctx.lineWidth = 3
        ctx.beginPath()

        data.forEach((value, index) => {
            const x = (index / (data.length - 1)) * width
            const y = height - ((value - 50000) / 80000) * height

            if (index === 0) {
                ctx.moveTo(x, y)
            } else {
                ctx.lineTo(x, y)
            }
        })

        ctx.stroke()
    }

    drawPortfolioChart()

    // Redraw on resize
    window.addEventListener("resize", drawPortfolioChart)
}

// Notification System
function showNotification(message, type = "info") {
    const notification = document.createElement("div")
    notification.className = `notification ${type}`
    notification.innerHTML = `
    <i class="fas fa-info-circle"></i>
    <span>${message}</span>
    <button class="close-btn"><i class="fas fa-times"></i></button>
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

    document.body.appendChild(notification)

    // Close button
    const closeBtn = notification.querySelector(".close-btn")
    closeBtn.addEventListener("click", () => {
        notification.remove()
    })

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove()
        }
    }, 5000)
}

// Add custom cursor for interactive elements
document.querySelectorAll(".btn-primary, .btn-secondary, .feature-card, .asset-card").forEach((el) => {
    el.style.cursor = "pointer"
})

// Performance optimization: Lazy load images
function lazyLoadImages() {
    const images = document.querySelectorAll("img[data-src]")

    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const img = entry.target
                img.src = img.dataset.src
                img.classList.remove("lazy")
                imageObserver.unobserve(img)
            }
        })
    })

    images.forEach((img) => {
        imageObserver.observe(img)
    })
}

// Initialize lazy loading
lazyLoadImages()

// Console welcome message
console.log(`
🚀 SAFVACUT WALLET v2.5.3
🔒 Next-Generation Crypto Security
💎 Built with Advanced Web Technologies
🌟 Serving 8M+ Users Worldwide
⚡ Lightning-Fast Performance
🛡️ Military-Grade Security
`)

// Initialize all features when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    // Add entrance animations to sections
    document.querySelectorAll("section").forEach((section, index) => {
        section.style.opacity = "0"
        section.style.transform = "translateY(30px)"
        section.style.transition = `opacity 0.8s ease ${index * 0.1}s, transform 0.8s ease ${index * 0.1}s`

        setTimeout(
            () => {
                section.style.opacity = "1"
                section.style.transform = "translateY(0)"
            },
            100 + index * 100,
        )
    })

    // Initialize ticker animation
    const ticker = document.querySelector(".ticker-scroll")
    if (ticker) {
        // Clone ticker items for seamless loop
        const tickerItems = ticker.innerHTML
        ticker.innerHTML = tickerItems + tickerItems
    }
})

// Handle window resize
window.addEventListener("resize", () => {
    // Redraw charts on resize
    document.querySelectorAll(".mini-chart").forEach((canvas) => {
        const symbol = canvas.dataset.symbol
        generateMiniChart(canvas, symbol)
    })
})

// Add touch gestures for mobile
let touchStartX = 0
let touchEndX = 0

document.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX
})

document.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].screenX
    handleGesture()
})

function handleGesture() {
    const swipeThreshold = 50
    const diff = touchStartX - touchEndX

    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swipe left - next testimonial
            nextTestimonial()
        } else {
            // Swipe right - previous testimonial
            prevTestimonial()
        }
    }
}

// Service Worker registration for PWA capabilities
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("/sw.js")
            .then((registration) => {
                console.log("SW registered: ", registration)
            })
            .catch((registrationError) => {
                console.log("SW registration failed: ", registrationError)
            })
    })
}

// Add demo video functionality
window.playDemo = () => {
    showNotification("Demo video coming soon! Experience the future of crypto wallets.", "info")
}

// Add asset action handlers
document.addEventListener("DOMContentLoaded", () => {
    // Asset action buttons
    document.addEventListener("click", (e) => {
        if (e.target.closest(".action-btn.buy")) {
            showNotification("Redirecting to buy crypto...", "info")
            setTimeout(() => {
                window.location.href = "signup-login.html"
            }, 1000)
        }

        if (e.target.closest(".action-btn.trade")) {
            showNotification("Redirecting to trading platform...", "info")
            setTimeout(() => {
                window.location.href = "signup-login.html"
            }, 1000)
        }
    })
})
