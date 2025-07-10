# ☁️ Cloud Environment Overview

### 🌐 Deployment Platform: Render

**Frontend**: Next.js deployed as Render Web Service  
🔗 [https://brainbytes-frontend-zk1e.onrender.com](https://brainbytes-frontend-zk1e.onrender.com)

**Backend**: Node.js + Express deployed as Render Web Service  
🔗 [https://brainbytes-backend-oj3s.onrender.com](https://brainbytes-backend-oj3s.onrender.com)

**Database**: MongoDB Atlas (External)

**AI Integration**: Groq API (External)

---

# ⚙️ Deployment Stack Summary

| Component | Type        | Build Command                  | Start Command           | Environment Variables                         |
|-----------|-------------|--------------------------------|--------------------------|-----------------------------------------------|
| Frontend  | Web Service | `npm install && npm run build` | `npm run start`          | `NEXT_PUBLIC_API_URL`                         |
| Backend   | Web Service | `npm install`                  | `node backend/server.js` | `MONGODB_URI`, `GROQ_API_KEY`, `PORT`, `JWT` |

