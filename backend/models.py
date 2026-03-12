from sqlalchemy import create_engine, Column, String, DateTime, Boolean, Text, Integer, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import uuid

Base = declarative_base()

def generate_uuid():
    return str(uuid.uuid4())

class Tenant(Base):
    __tablename__ = "tenants"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    brand_name = Column(String)
    brand_logo = Column(String)
    brand_colors = Column(String, default="#e94560")
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    webhook_url = Column(String)
    subscription_tier = Column(String, default="starter")
    twilio_account_sid = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    clients = relationship("Client", back_populates="tenant")

class Client(Base):
    __tablename__ = "clients"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    tenant_id = Column(String, ForeignKey("tenants.id"), nullable=False)
    business_name = Column(String, nullable=False)
    contact_name = Column(String)
    contact_email = Column(String)
    contact_phone = Column(String)
    phone_number = Column(String)
    greeting_message = Column(String, default="Hello, you've reached our office. How can I help?")
    voice_personality = Column(String, default="professional")
    services_offered = Column(Text)  # JSON string
    operating_hours = Column(Text)  # JSON string
    notify_config = Column(Text)  # JSON string
    status = Column(String, default="trial")  # trial, active, paused
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    tenant = relationship("Tenant", back_populates="clients")
    calls = relationship("Call", back_populates="client")

class Call(Base):
    __tablename__ = "calls"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    client_id = Column(String, ForeignKey("clients.id"), nullable=False)
    caller_number = Column(String)
    caller_name = Column(String)
    direction = Column(String)  # inbound, outbound
    duration = Column(Integer)  # seconds
    transcript = Column(Text)
    summary = Column(Text)
    outcome = Column(String)  # booked, message, redirect, failed
    cost = Column(String)
    recording_url = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    client = relationship("Client", back_populates="calls")

# Database setup
DATABASE_URL = "sqlite:///./callpilot.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
