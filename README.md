# Safvacut - Secure Crypto Wallet

Safvacut is a secure and intuitive web-based cryptocurrency wallet designed to help users manage, trade, and grow their digital assets with confidence. It features a modern, responsive UI with light and dark theme support, Firebase authentication, and a comprehensive dashboard for tracking portfolio performance, transactions, and staking options.

## Features

-   **Secure Authentication**:
    -   Email and password registration/login.
    -   Social login options (Google, Apple, Twitter) powered by Firebase Authentication.
    -   Password reset functionality.
    -   Persistent user sessions.
-   **Responsive Design**: Optimized for seamless experience across desktop, tablet, and mobile devices.
-   **Modern UI/UX**:
    -   Clean, glassmorphism-inspired design.
    -   Light and Dark theme support with persistent preference.
    -   Smooth animations and transitions.
    -   Customizable color palette defined via CSS variables.
-   **Comprehensive Dashboard**:
    -   Overview of total portfolio value and 24-hour change.
    -   Quick action buttons for Send, Receive, Buy, and Swap cryptocurrencies.
    -   Dynamic display of your assets with current prices and percentage changes.
    -   Recent transaction activity feed.
    -   Market overview section with top cryptocurrencies.
-   **Portfolio Analytics**: Detailed view of asset allocation and performance statistics.
-   **Trading Terminal**: Mock order book and recent trades display for a simulated trading experience.
-   **Transaction History**: Filterable list of all cryptocurrency transactions by type, asset, and date.
-   **Staking Rewards**: Section to view available staking options and earn passive income.
-   **Account Settings**: Manage display name and view email, with security settings placeholders.
-   **Modals**: Interactive modals for Send, Receive, Buy, and Swap operations.
    -   Receive modal generates QR codes and displays wallet addresses.
    -   Send modal dynamically updates crypto logo based on selected asset.
-   **Toast Notifications**: User feedback for actions like copying addresses or profile updates.

## Technologies Used

-   **HTML5**: Structure of the web pages.
-   **Tailwind CSS**: Utility-first CSS framework for rapid styling and responsiveness.
-   **Firebase**:
    -   **Firebase Authentication**: For user registration, login, and social authentication.
    -   **Cloud Firestore**: For storing user profiles and potentially other application data.
-   **JavaScript (ES6+)**: Core logic for interactivity, data handling, and API integrations.
-   **Chart.js**: For rendering interactive portfolio value charts.
-   **SweetAlert2**: For beautiful, responsive, and customizable alert messages.
-   **QRCode.js**: For generating QR codes in the receive modal.
-   **Google Fonts**: `Inter` for general text and `Orbitron` for display elements.
-   **Font Awesome**: For various icons used throughout the application.

## Project Structure

\`\`\`
.
├── Public/
│   ├── btc.png
│   ├── eth.png
│   ├── eth-coin.jpg
│   ├── hand-bitcoin.jpg
│   ├── iso-ill.webp
│   ├── logo.png
│   ├── mainl-logo.png
│   ├── person-managing.jpg
│   ├── trx.png
│   ├── usdt-eth.png
│   ├── usdt-tron.png
│   └── Elixa Coin-Project Documentation.pdf
├── auth.html
├── dashboard.html
├── index.html
└── README.md
└── style-guide.md
\`\`\`

-   `index.html`: The landing page of the application.
-   `auth.html`: Handles user authentication (login and registration).
-   `dashboard.html`: The main user dashboard with portfolio, trading, transactions, and staking sections.
-   `Public/`: Contains all static assets like images and documents.
-   `style-guide.md`: Documents the UI style guide, including colors, typography, and spacing.

## Setup Instructions

To run this project locally, follow these steps:

1.  **Clone the repository:**
    \`\`\`bash
    git clone <repository-url>
    cd safvacut
    \`\`\`

2.  **Open the HTML files:**
    Simply open `index.html`, `auth.html`, or `dashboard.html` in your web browser. Since this is a client-side application, no server setup is strictly required for basic viewing.

3.  **Firebase Configuration (for full functionality):**
    The project uses Firebase for authentication and user profile storage. To enable full authentication features:
    -   Go to the [Firebase Console](https://console.firebase.google.com/).
    -   Create a new Firebase project.
    -   Add a web app to your Firebase project.
    -   Copy your Firebase configuration object.
    -   **Replace the placeholder `firebaseConfig` object** in `auth.html` and `dashboard.html` with your actual Firebase configuration.
        \`\`\`javascript
        // In auth.html and dashboard.html
        const firebaseConfig = {
          apiKey: "YOUR_API_KEY",
          authDomain: "YOUR_AUTH_DOMAIN",
          projectId: "YOUR_PROJECT_ID",
          storageBucket: "YOUR_STORAGE_BUCKET",
          messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
          appId: "YOUR_APP_ID",
          measurementId: "YOUR_MEASUREMENT_ID"
        };
