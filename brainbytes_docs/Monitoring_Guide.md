### 📈 Monitoring Guide
#### Metrics Available
- brainbytes_http_requests_total – Total HTTP requests
- brainbytes_ai_responses_total – AI replies count
- brainbytes_ai_latency_seconds – Latency of AI replies
- brainbytes_active_sessions – Current open sessions
- brainbytes_total_users – Registered users
- Node metrics from node_exporter
#### Grafana Panels
- AI Response Time → brainbytes_ai_latency_seconds
- Total HTTP Requests → brainbytes_http_requests_total
- Active Sessions → brainbytes_active_sessions
- AI Requests by Minute → Rate of brainbytes_ai_responses_total

#### Prometheus Alert Rules
```
groups:
  - name: brainbytes-alerts
    rules:
      - alert: BackendDown
        expr: up{job="backend"} == 0
        for: 30s
        labels:
          severity: critical
        annotations:
          summary: "Backend service is down"
          description: "No metrics from the backend service for 30 seconds."

      - alert: HighCPUUsage
        expr: process_cpu_seconds_total{job="backend"} > 0.85
        for: 1m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage detected"
```