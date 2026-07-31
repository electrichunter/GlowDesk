import pytest
from app.services.payment_service import payment_service, ProcessPaymentRequest

def test_luhn_algorithm_valid_card():
    # Valid Visa card sample (4532 0151 1283 0366)
    req = ProcessPaymentRequest(
        invoice_id="inv-123",
        amount=150.0,
        currency="TRY",
        card_holder="AHMET YILMAZ",
        card_number="4532015112830366",
        expire_month="12",
        expire_year="2030",
        cvv="123"
    )
    result = payment_service.process_credit_card(req)
    assert result.success is True
    assert result.transaction_id.startswith("TX-")
    assert result.receipt_signature is not None
    assert result.masked_card == "4532 **** **** 0366"

def test_luhn_algorithm_invalid_card():
    with pytest.raises(ValueError, match="Luhn algoritması"):
        ProcessPaymentRequest(
            invoice_id="inv-123",
            amount=150.0,
            currency="TRY",
            card_holder="AHMET YILMAZ",
            card_number="4532015112830367",  # Invalid checksum
            expire_month="12",
            expire_year="2030",
            cvv="123"
        )

def test_expired_card_rejected():
    req = ProcessPaymentRequest(
        invoice_id="inv-123",
        amount=150.0,
        currency="TRY",
        card_holder="AHMET YILMAZ",
        card_number="4532015112830366",
        expire_month="01",
        expire_year="2020",  # Expired
        cvv="123"
    )
    result = payment_service.process_credit_card(req)
    assert result.success is False
    assert "geçmiş" in result.message
