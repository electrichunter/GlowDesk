# GlowDesk Yük ve Stres Testi (Load & Stress Testing)

GlowDesk FastAPI Backend ve Ödeme Geçidinin yüksek eşzamanlı istek (concurrency) altında performansını ölçmek için hazırlanmış Locust stres testi rehberi.

## Kurulum ve Çalıştırma

```bash
pip install locust

# Stres testini başlat
cd devops/load-testing
locust -f locustfile.py --host=http://localhost:8000
```

Web arayüzünden (`http://localhost:8089`):
- **Number of users**: 500
- **Spawn rate**: 50 user/sec

## Hedef Metrikler & Web Vitals
- **Target RPS (Requests Per Second)**: > 800 req/sec
- **p95 Latency**: < 120 ms
- **Fail Ratio**: %0.0
