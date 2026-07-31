def test_register_business_and_login(client):
    payload = {
        "businessName": "Test Güzellik Salonu",
        "ownerName": "Ayşe Yılmaz",
        "email": "ayse@glowdesk.com",
        "phone": "+905559998877",
        "password": "Password123!",
        "sector": "beauty"
    }
    # Register
    res = client.post("/api/v1/auth/register/business", json=payload)
    assert res.status_code == 200
    res_data = res.json()
    assert "token" in res_data
    assert res_data["user"]["email"] == "ayse@glowdesk.com"

    # Login
    login_payload = {
        "email": "ayse@glowdesk.com",
        "password": "Password123!"
    }
    login_res = client.post("/api/v1/auth/login", json=login_payload)
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()
