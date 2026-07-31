def test_payment_process_e2e_sandbox_flow(client):
    payload = {
        "invoice_id": "INV-2026-001",
        "amount": 450.0,
        "currency": "TRY",
        "card_holder": "MEHMET DEMİR",
        "card_number": "4532015112830366",  # LUHN valid test card
        "expire_month": "11",
        "expire_year": "2030",
        "cvv": "999",
        "provider": "iyzico_sandbox",
        "idempotency_key": "IDEM-TEST-KEY-001"
    }

    response = client.post("/api/v1/payments/process", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["success"] is True
    assert data["provider"] == "iyzico_sandbox"
    assert data["transaction_id"].startswith("TX-IYZI-")
    assert data["receipt_signature"] is not None
    assert data["three_d_secure_url"] is not None
    assert data["masked_card"] == "4532 **** **** 0366"

def test_payment_idempotency_prevents_double_charge(client):
    payload = {
        "invoice_id": "INV-2026-002",
        "amount": 200.0,
        "currency": "TRY",
        "card_holder": "CANAN KAYA",
        "card_number": "4532015112830366",
        "expire_month": "05",
        "expire_year": "2029",
        "cvv": "456",
        "idempotency_key": "UNIQUE-KEY-888"
    }

    # First attempt
    res1 = client.post("/api/v1/payments/process", json=payload)
    assert res1.status_code == 200
    tx1 = res1.json()["transaction_id"]

    # Second identical attempt (Idempotency prevents second charge)
    res2 = client.post("/api/v1/payments/process", json=payload)
    assert res2.status_code == 200
    tx2 = res2.json()["transaction_id"]

    # Should return exact same transaction result without re-charging
    assert tx1 == tx2
