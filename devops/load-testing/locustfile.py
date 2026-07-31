import random
from locust import HttpUser, task, between

class GlowDeskLoadTestUser(HttpUser):
    wait_time = between(1, 3)

    @task(3)
    def test_healthcheck(self):
        self.client.get("/api/v1/health")

    @task(2)
    def test_list_tenants(self):
        self.client.get("/api/v1/tenants")

    @task(1)
    def test_payment_process_stress(self):
        payload = {
            "invoice_id": f"INV-STRESS-{random.randint(1000, 9999)}",
            "amount": float(random.randint(100, 1500)),
            "currency": "TRY",
            "card_holder": "STRESS TEST USER",
            "card_number": "4532015112830366",
            "expire_month": "12",
            "expire_year": "2030",
            "cvv": "123",
            "provider": "iyzico_sandbox",
            "idempotency_key": f"IDEM-STRESS-{random.randint(10000, 99999)}"
        }
        self.client.post("/api/v1/payments/process", json=payload)
