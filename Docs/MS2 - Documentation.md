# 🧾 Milestone 2 Documentation — BrainBytes

## 📌 Introduction

### Project Overview
**BrainBytes** is a containerized AI-powered tutoring platform, featuring a chat interface for student interactions. It leverages a microservice architecture with separate frontend and backend services, utilizing MongoDB for data persistence and Groq for intelligent AI responses.

### Milestone 2 Objectives
- Implement a complete CI/CD pipeline using GitHub Actions  
- Deploy containerized services (frontend + backend) to the cloud (Render)  
- Automate testing, deployment, and environment management  
- Ensure robust integration between local development and cloud environments

### Team Responsibilities
- **CI/CD Automation**: Set up GitHub Actions workflows  
- **Containerization**: Dockerize all core components  
- **Testing**: Implement and maintain unit, integration, and E2E tests  
- **Deployment**: Configure and maintain deployment on Render  
- **Monitoring & Security**: Ensure secrets handling and service availability  

---

## 🔁 CI/CD Implementation

### Pipeline Architecture

```mermaid
flowchart LR
  A[Code Commit / Pull Request] --> B[GitHub Actions]
  B --> C[Render (Deploy API)]
  B --> D[Linting, Tests, Builds]
  D --> E[E2E + Docker Compose Integration]


*This diagram illustrates the CI/CD pipeline: code commits or pull requests trigger GitHub Actions, which run linting, tests, builds, and E2E integration. Successful builds are deployed to Render via its Deploy API.*


### GitHub Actions Workflow Files
- `.github/workflows/main.yml`: Lints and tests backend & frontend  
- `.github/workflows/main.yml`: Runs containerized integration tests with MongoDB  
- `.github/workflows/deploy.yml`: Deploys both services to Render using `render-deploy@v1.4.5`  

### Integration with Containerized Application
- Frontend and backend are Dockerized
- Docker Compose used for both local testing and GitHub Actions
- Shared MongoDB container used in CI testing

### Testing Strategy in the Pipeline
- Linting via ESLint  
- Unit tests via Jest and React Testing Library  
- Playwright E2E tests executed post-build  
- Tests fail the workflow on error

---

## ☁️ Cloud Deployment

### Cloud Platform Architecture (Render)

Frontend (Web Service)
  └── Render URL: brainbytes-frontend-<id>.onrender.com

Backend (Web Service)
  └── Connected to MongoDB via MONGO_URI
  └── Integrated with Groq for AI responses


### Resource Configuration
- Frontend: `npm run build` and `npm start` as commands  
- Backend: Express server on Node.js  
- MongoDB: External (Atlas) via `MONGO_URI`

### Networking and Security Setup
- Environment variables stored in Render dashboard  
- GitHub secrets used for workflow injection  
- Only required ports exposed (443/80 through Render)

### Deployment Process Flow
1. Code pushed to `main` triggers GitHub Actions
2. CI/CD runs lint/test/build stages
3. `render-deploy` action deploys to Render
4. Workflow waits and verifies deployment status

---

## 🔗 Integration Points

### GitHub Actions ↔️ Render Integration
- Uses [`JorgeLNJunior/render-deploy@v1.4.5`](https://github.com/JorgeLNJunior/render-deploy)  
- Requires `RENDER_API_KEY` and `SERVICE_ID` passed via GitHub Secrets

### Environment Variable Management
- `.env` is generated during CI
- Render injects variables per service via its UI

### Secrets Handling
- GitHub Secrets: `RENDER_API_KEY`, `SERVICE_ID`, `JWT_SECRET`, etc.  
- Not echoed in CI logs (masked by GitHub)

### Artifact Management
- Build artifacts like `.next` are cached optionally in CI  
- No long-term artifact storage (built fresh per deploy)

---

## 🧪 Testing and Validation

### Pipeline Testing Procedures
- Pull request triggers:
  - Linting
  - Unit tests (frontend/backend)
  - Docker Compose integration test
  - Playwright E2E tests

### Deployment Validation
- `/health` endpoints validated via `curl`
- Logs printed if services fail to respond

### Rollback Procedures
- Use Render's dashboard to revert to previous successful deploy
- No automated rollback in this version

### Monitoring and Observability
- Logs viewable on Render per deploy
- GitHub Actions logs provide full trace per step
- `docker compose logs` used in CI for debugging

---

## ⚙️ Operational Guide

### Troubleshooting Procedures
- Start by inspecting GitHub logs
- Use `docker compose ps` and `docker compose logs` to view service states
- If CI fails, inspect `.env`, service IDs, and secrets

### Maintenance Tasks
- Rotate secrets regularly
- Update Docker base images and dependencies
- Run tests regularly to catch regressions

### Security Management
- All secrets managed securely via GitHub and Render
- No secrets are stored in codebase
- JWT-based auth in backend
- Only required ports and services exposed

---

