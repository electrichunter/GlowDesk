import uuid
from datetime import date, time
from faker import Faker
from app.models.tenant import Tenant
from app.models.user import User
from app.models.appointment import Appointment
from app.models.customer import Customer
from app.core.security import get_password_hash

fake = Faker("tr_TR")

class TenantFactory:
    @staticmethod
    def create(name: str = None, sector: str = "beauty") -> Tenant:
        name = name or fake.company()
        slug = f"{name.lower().replace(' ', '-')}-{uuid.uuid4().hex[:4]}"
        return Tenant(
            id=str(uuid.uuid4()),
            name=name,
            slug=slug,
            sector=sector,
            phone=fake.phone_number(),
            email=fake.company_email(),
            city="İstanbul",
            district="Kadıköy",
            subscription_tier="pro",
            status="active"
        )

class UserFactory:
    @staticmethod
    def create(tenant_id: str = None, role: str = "customer") -> User:
        return User(
            id=str(uuid.uuid4()),
            tenant_id=tenant_id,
            email=fake.email(),
            password_hash=get_password_hash("password123"),
            full_name=fake.name(),
            phone=fake.phone_number(),
            role=role,
            is_active=True
        )

class AppointmentFactory:
    @staticmethod
    def create(tenant_id: str, service_id: str = "srv-1", staff_id: str = "stf-1") -> Appointment:
        return Appointment(
            id=str(uuid.uuid4()),
            tenant_id=tenant_id,
            service_id=service_id,
            staff_id=staff_id,
            customer_name=fake.name(),
            customer_phone=fake.phone_number(),
            appointment_date=date.today(),
            start_time=time(14, 0),
            end_time=time(15, 0),
            total_price=250.0,
            status="scheduled"
        )

class CustomerFactory:
    @staticmethod
    def create(tenant_id: str) -> Customer:
        return Customer(
            id=str(uuid.uuid4()),
            tenant_id=tenant_id,
            name=fake.name(),
            phone=fake.phone_number(),
            email=fake.email()
        )
