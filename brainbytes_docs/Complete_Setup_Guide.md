# 📘 BrainBytes-AI Tutoring App Documentation

## 📦 Setup Guide

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- MongoDB (local or containerized)
- Prometheus + Grafana (for monitoring)
- Hugging Face API key
- Create `.env` file in `backend/`:
  ```env
  PORT=4000
  MONGO_URI=mongodb://mongodb:27017/brainbytes
  HUGGING_FACE_API_KEY=your_hf_key
  NEXT_PUBLIC_API_URL=http://localhost:4000

### Clone and Install
```
git clone https://github.com/your-org/brainbytes.git
cd brainbytes
```
### Run Locally (Development Mode)
#### Install dependencies
```
cd backend && npm install
cd ../frontend && npm install
```
#### Start with Docker
```
docker-compose up --build
```
### Access Points
| Service     | URL                                            |
| ----------- | ---------------------------------------------- |
| Frontend    | [http://localhost:3000](http://localhost:3000) |
| Backend API | [http://localhost:4000](http://localhost:4000) |
| MongoDB     | mongodb://localhost:27017                      |
| Grafana     | [http://localhost:3001](http://localhost:3001) |
| Prometheus  | [http://localhost:9090](http://localhost:9090) |
### Operations Manual
#### User Roles
- Guest Users: Start chat immediately without login.
- Registered Users: Save sessions, access history.
- Admin (optional): Future support for system monitoring and user management.
#### Core Features
- Smart AI tutoring via Hugging Face
- Session-based chat with history stored in MongoDB
- Real-time metrics and monitoring
- Mobile-friendly interface
#### Routine Operations
| Task                    | Command / Action                        |
| ----------------------- | --------------------------------------- |
| Restart services        | `docker-compose restart`                |
| Update app              | `git pull && docker-compose up --build` |
| Access backend logs     | `docker-compose logs -f backend`        |
| Drop DB collections     | Use MongoDB CLI or Compass              |
| Check sessions manually | `db.sessions.find()` in MongoDB shell   |

