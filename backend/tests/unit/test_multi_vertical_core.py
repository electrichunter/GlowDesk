"""
Unit tests for multi-vertical core engines:
  - ResourceOrchestrator (atomic locking & conflict detection)
  - CreditEngine (double-entry ledger & balance management)
"""
import pytest
from datetime import time, date, datetime
from app.models.tenant import Tenant
from app.models.resource import Resource
from app.models.package import Package, CustomerPackage
from app.models.appointment import Appointment
from app.services.resource_orchestrator import ResourceOrchestrator, ResourceConflictError
from app.services.credit_engine import CreditEngine, InsufficientCreditError


def test_resource_orchestrator_locking_and_conflict(db_session):
    tenant = Tenant(id="tenant-1", name="Klinik A", slug="klinik-a", sector="clinic")
    db_session.add(tenant)

    res1 = Resource(id="res-1", tenant_id="tenant-1", name="Dental Ünit 1", resource_type="equipment", capacity=1)
    db_session.add(res1)
    db_session.commit()

    orchestrator = ResourceOrchestrator(db_session)

    # 1. Lock check - available slot
    locked = orchestrator.check_and_lock_resources(
        tenant_id="tenant-1",
        resource_ids=["res-1"],
        start_time=time(10, 0),
        end_time=time(11, 0),
    )
    assert locked == ["res-1"]

    # 2. Bind resources to appointment
    app1 = Appointment(
        id="app-1", tenant_id="tenant-1", customer_name="Ahmet", customer_phone="05001112233",
        appointment_date=date.today(), start_time=time(10, 0), end_time=time(11, 0), status="scheduled"
    )
    db_session.add(app1)
    db_session.commit()

    orchestrator.bind_resources_to_appointment(
        appointment_id="app-1", resource_ids=["res-1"], start_time=time(10, 0), end_time=time(11, 0)
    )

    # 3. Conflicting slot check should raise ResourceConflictError
    with pytest.raises(ResourceConflictError):
        orchestrator.check_and_lock_resources(
            tenant_id="tenant-1",
            resource_ids=["res-1"],
            start_time=time(10, 30),
            end_time=time(11, 30),
        )


def test_credit_engine_ledger_flow(db_session):
    tenant = Tenant(id="tenant-2", name="Pilates Studio", slug="pilates-studio", sector="fitness")
    db_session.add(tenant)
    db_session.commit()

    pkg = Package(id="pkg-1", tenant_id="tenant-2", name="10'lu Reformer", total_units=10)
    cp = CustomerPackage(id="cp-1", customer_id="cust-1", package_id="pkg-1", tenant_id="tenant-2", remaining_units=10, status="active")
    db_session.add_all([pkg, cp])
    db_session.commit()

    engine = CreditEngine(db_session)

    # 1. Consume credit
    entry1 = engine.consume_credit("cp-1", units=2, description="2 Ders Tüketimi")
    assert entry1.balance_after == 8
    assert cp.remaining_units == 8

    # 2. Refund credit
    entry2 = engine.refund_credit("cp-1", units=1, description="İptal İadesi")
    assert entry2.balance_after == 9
    assert cp.remaining_units == 9

    # 3. Insufficient credit test
    with pytest.raises(InsufficientCreditError):
        engine.consume_credit("cp-1", units=15)


