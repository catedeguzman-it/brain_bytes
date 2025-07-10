# 📦 BrainBytes Deployment Plan

This document outlines the full deployment strategy for the **BrainBytes** AI chat platform using Render, Groq, MongoDB Atlas, and containerized development.

---

## 🧭 Table of Contents

1. [Overview](#overview)  
2. [Environment Architecture](#environment-architecture)  
3. [Resource Specifications](#resource-specifications)  
4. [Continuous Deployment Pipeline](#continuous-deployment-pipeline)  
5. [Security Measures](#security-measures)  
6. [Local Development & Containerization](#local-development--containerization)  
7. [Rollout Plan](#rollout-plan)  
8. [Monitoring & Logs](#monitoring--logs)  
9. [Deployment Checklist](#deployment-checklist)

---

## 📌 Overview

BrainBytes is a containerized, cloud-native AI platform built using:

- **Frontend**: Next.js (React)
- **Backend**: Node.js (Express API)
- **Database**: MongoDB Atlas
- **AI Provider**: Groq API
- **Hosting**: Render.com
- **CI/CD**: GitHub → Render

---

## 🌐 Environment Architecture
![Deployment Architecture Diagram](<Deployment Architecture Diagram.png>)
### ⚙️ Components

| Component     | Description                            | Hosting / Platform     |
|---------------|----------------------------------------|-------------------------|
| Frontend      | Next.js React web app                  | Render Web Service      |
| Backend       | Node.js Express API                    | Render Web Service      |
| Database      | MongoDB Atlas                          | MongoDB Cloud           |
| AI Provider   | Groq LLM API                           | External API            |
| Container Dev | Multi-container Docker setup           | Local via Docker Compose|

### 🗺️ Network Topology

User ⇄ Frontend (Render)
⇅
Backend API (Render)
⇅
MongoDB Atlas
⇅
Groq API


---

## 📦 Resource Specifications

### 🧩 Frontend

- **Framework**: Next.js (React)
- **Render Type**: Web Service
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start`
- **Env Vars**:
  - `NEXT_PUBLIC_API_URL=https://brainbytes-backend.onrender.com`

### ⚙️ Backend

- **Framework**: Node.js with Express
- **Render Type**: Web Service
- **Start Command**: `node server.js`
- **Env Vars**:
  - `MONGODB_URI=<MongoDB Atlas URI>`
  - `GROQ_API_KEY=<Groq API Key>`
  - `PORT=4001`

### 🗃️ Database

- **Service**: MongoDB Atlas (Free M0 tier)
- **Collections**: `users`, `messages`, `sessions`, `profiles`
- **Security**:
  - IP Whitelisting
  - Role-based DB user

---

## 🔄 Continuous Deployment Pipeline

### 🪜 CI/CD Steps

| Stage           | Tool       | Description                          |
|----------------|------------|--------------------------------------|
| Build           | Render     | Triggered on `main` branch push      |
| Test            | Playwright | Run E2E tests before deployment      |
| Deploy Frontend | Render     | Static + SSR site                    |
| Deploy Backend  | Render     | Express server with Groq + MongoDB   |
| Monitor         | Render     | Auto logs and crash recovery         |

---

## 🔐 Security Measures

### 🔒 Backend

- CORS restrictions for allowed origins
- Secure `.env` configuration
- Rate limiting and input validation

### 🧠 AI Integration (Groq)

- Secure API key in environment
- Timeout handling on Groq requests
- Failover logging for non-responses

### 🔑 MongoDB Atlas

- Encrypted credentials
- IP Whitelisting
- Role-based access control (RBAC)

---

## 🐳 Local Development & Containerization

### 🧱 Docker Compose Setup

```yaml
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:4001

  backend:
    build: ./backend
    ports:
      - "4001:4001"
    environment:
      - MONGODB_URI=<your-local-mongo-uri>
      - GROQ_API_KEY=<your-api-key>


📅 Rollout Plan
Phase	Timeline	Description
Local Testing	Week 1–2	Test Dockerized system + API connectivity
Pre-deploy QA	Week 3	Run Playwright E2E tests
Initial Deployment	Week 4	Deploy to Render
Monitoring Setup	Week 5	Observe logs and set alerts
Feature Iteration	Week 6–8	Apply feedback + enhancements

📊 Monitoring & Logs
Render: Live deployment logs + crash reports

MongoDB Atlas: Query and performance dashboards

Health Checks: Built-in via Render auto-restarts

Incident Alerts: Optional webhook/Slack integration

✅ Deployment Checklist
 Code pushed to main

 Render services configured (frontend/backend)

 MongoDB Atlas connected

 Groq API key secured in env

 Frontend env variable for backend URL

 Docker Compose verified locally

 End-to-end tests passed