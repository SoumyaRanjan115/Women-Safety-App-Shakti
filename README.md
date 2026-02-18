# 🛡️ Shakti – Women Safety App

A smart women safety mobile application built using **Expo (React Native)** and **Firebase**, featuring an intelligent contextual **Danger Score System** for proactive risk awareness.

---

## 🚀 Project Overview

**Shakti** is designed to enhance personal safety through:

- 🚨 One-tap SOS emergency trigger  
- 📍 Real-time location tracking  
- 🧠 Context-aware Danger Score system  
- 📊 Incident history tracking  
- 🔥 Cloud-based logging with Firebase  

This app was developed as a mini project focusing on practical safety technology with scalable AI-ready architecture.

---

# ✨ Features

## 🚨 1. One-Tap SOS Emergency System

- Large central SOS button
- Sends emergency alert with:
  - Live GPS location
  - Timestamp
  - Danger Score
- Logs incident in Firestore for future analysis

---

## 🧠 2. Smart Danger Score System (Contextual ML Logic)

A lightweight rule-based ML-style scoring engine that calculates risk (0–100) based on:

### 🔎 Risk Factors

| Factor | Condition | Risk Impact |
|--------|----------|------------|
| 🌙 Time | 11 PM – 4 AM | High Risk |
| 🚗 Speed | > 25 km/h | Medium Risk |
| 📍 Location | Outside known safe zones | Risk Increase |
| 🧾 Past Incidents | SOS within 500m radius | Risk Increase |

---

### 🎯 Danger Levels

| Score Range | Level | UI Color |
|-------------|--------|---------|
| 0 – 30 | SAFE | 🟢 Green |
| 31 – 60 | CAUTION | 🟡 Yellow |
| 61 – 100 | HIGH RISK | 🔴 Red |

---

## 📊 3. Firestore Incident Logging

Every SOS event logs:

- Latitude
- Longitude
- Speed
- Timestamp
- Danger Score
- Danger Level
- Reasons for scoring

Path:
