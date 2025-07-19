### 🧯 Troubleshooting Guide
#### Backend Doesn’t Start
- Ensure ports 3000, 10000, and 9090 are not in use
- Check .env is correctly set
- Run: docker-compose logs backend to inspect errors
#### No AI Response
- Verify GROQ API KEY in .env
- Confirm GROQ API is live: https://groq.com
- Review: backend/services/aiService.js
#### Prometheus/Grafana Empty
- Is /metrics exposed? Visit http://localhost:10000/metrics
- Check if Prometheus is scraping the backend
- Confirm correct job names in prometheus.yml
#### MongoDB Issues
- Run: docker exec -it mongodb mongosh
- Inspect collections:
    ```
    use brainbytes
    db.sessions.find().pretty()
    ```
#### Frontend Slow or Broken
- Check Chrome DevTools Network tab
- Monitor brainbytes_ai_latency_seconds
- Look at logs: docker-compose logs frontend