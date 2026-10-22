# 🗳️ SECURE-VOTE — Student E-Voting & Blockchain Balloting Platform

[![Live Demo](https://img.shields.io/badge/Demo-securevote.gakenye--ndiritu.co.ke-blue?style=for-the-badge&logo=nginx)](https://securevote.gakenye-ndiritu.co.ke)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Ethereum](https://img.shields.io/badge/Ethereum-Sepolia-3C3C3D?style=for-the-badge&logo=ethereum)](https://sepolia.etherscan.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

**SECURE-VOTE** is an election platform built for Laikipia University. Designed to eliminate long queues, counting errors, and voting accessibility barriers, SECURE-VOTE allows students to cast votes securely from their phones with immutable blockchain verification.

---

## 🏆 Innovation & Recognition

- **🥈 2nd Place Winner at Laikipia University Innovation Day** — Recognized for making campus voting safe, fast, transparent, and decentralized.

---

## 🚀 Key Features

- **🔒 Immutable Blockchain Balloting:** Every cast vote is anchored to the Ethereum Sepolia network, ensuring records cannot be altered or deleted.
- **📱 Vote from Anywhere:** Mobile voter application (React Native & Expo) enabling seamless remote balloting.
- **📊 Real-Time Election Analytics:** Live turnout tracking, candidate tallies, and coalition standings.
- **🔑 End-to-End Encryption:** AES-256 encrypted voter payloads and biometric identity validation.
- **🔍 Self-Audit & Verification:** Transparent cryptographic receipts allowing voters to verify their ballot inclusion.

---

## 🎯 Our Mission

Traditional paper and database-driven election systems remain vulnerable to admin overrides, manual counting mistakes, and long voter queues. SECURE-VOTE was built to ensure:
- **Zero Tampering:** Cast votes are immutable once recorded.
- **Maximum Security:** Cryptographic hashing paired with AES-256 encryption.
- **Universal Access:** Students can participate securely from any smartphone or tablet.
- **Complete Transparency:** Independent voter receipt verification and real-time live results.

---

## 🛠️ Tech Stack

| Domain | Tools & Technologies |
| :--- | :--- |
| **Frontend Web** | React 18, TypeScript, Vite, Tailwind CSS, DaisyUI, Framer Motion |
| **Mobile App** | React Native, Expo |
| **Backend & API** | Node.js, Express, TypeScript |
| **Database & ORM** | PostgreSQL, Drizzle ORM |
| **Smart Contracts & Network** | Solidity, Ethereum Sepolia Testnet |
| **State & Data Fetching** | Redux Toolkit, RTK Query, Redux Persist |
| **Security & Cryptography** | AES-256 Encryption, JWT Authentication |
| **Infrastructure & Hosting** | Ubuntu Linux VPS, Nginx, PM2, Certbot SSL, Cloudflare |

---

## 🔒 Security Architecture

1. **Decentralized Ledger:** Unlike conventional database storage where database administrators retain write access, SECURE-VOTE writes finalized votes directly to smart contracts deployed on the **Ethereum Sepolia** network.
2. **AES-256 Payload Encryption:** Voter identity and ballot selections are encrypted locally before submission to preserve strict ballot secrecy.
3. **Automated System Health Checks:** Real-time network monitoring ensures zero downtime during active campus elections.

---

## 📦 Local Setup & Installation

### Prerequisites
- **Node.js**: `v18.x` or higher
- **pnpm**: `v8.x` or higher

### Steps

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/Gakenye8741/online-voting-system.git](https://github.com/Gakenye8741/online-voting-system.git)
   cd online-voting-system/e-Laikipia-web-App
