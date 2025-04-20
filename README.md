# MSN - Digital Bill Splitter & Expense Manager

[![Code Coverage](https://codecov.io/gh/saisandeepramavath/SWEN732PROJ/branch/main/graph/badge.svg)](https://codecov.io/gh/saisandeepramavath/SWEN732PROJ)
[![SonarCloud](https://sonarcloud.io/api/project_badges/measure?project=saisandeepramavath_SWEN732PROJ&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=saisandeepramavath_SWEN732PROJ)

---

## 👨‍💻 Team Information

**Team Name:** MSN  
**Team Members:**
- Sai Sandeep Ramavath  
- Mallikarjuna Tupakula  
- Nithikesh Reddy Bobilli

---

## 📌 Executive Summary

Tracking shared expenses can be challenging—especially for friends, roommates, or travel groups. Our **Digital Bill Splitter & Expense Manager** simplifies this with:

- Group creation and friend management
- Categorized expense tracking
- Custom or equal cost splitting
- Payment reminders
- Expense summaries and exports
- Offline entry and real-time sync

Built with **Expo React Native** and **Firebase**, it ensures a fast, real-time, and cross-platform experience.

---

## ✅ MVP Features

- User Registration & Login  
- Profile Management  
- Group Expense Management  
- Expense Categorization & Notes  
- Equal & Custom Splits  
- Debt Tracking & Reminders  
- Expense Reports and Charts  
- Multi-Currency Support  
- Offline Mode  
- Export and Share Reports  

---

## 📐 Architecture Overview

### Layers

- **Presentation Layer:** Expo React Native UI  
- **Domain Layer:** Business logic (expenses, groups, reminders)  
- **Services Layer:** Firebase modules (auth, Firestore, FCM)

### Tech Stack

| Layer                | Technology                          |
|---------------------|-------------------------------------|
| Frontend            | Expo React Native                   |
| Realtime DB         | Firebase Firestore                  |
| Auth                | Firebase Authentication             |
| Notifications       | Firebase Cloud Messaging (FCM)      |
| Storage             | Firebase Storage                    |
| Charts              | Victory                             |
| Testing             | Jest, React Native Testing Library  |
| Quality Analysis    | Codecov, SonarCloud                 |

---

## ⚙️ Project Setup & Installation

### 1. Clone the Repository

```bash
git clone https://github.com/saisandeepramavath/SWEN732PROJ.git
cd SWEN732PROJ/MSN
```

### 2. Install Dependencies

```node
yarn install
```

### 3. Configure Firebase
Create a firebaseConfig.js file in /MSN:

```
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};
```
### 4 Start

```node
yarn start
```


