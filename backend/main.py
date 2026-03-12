from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import JWTError, jwt
from typing import Optional, List
import json

from models import Tenant, Client, Call, get_db, init_db

# Initialize database
init_db()

app = FastAPI(title="CallPilot API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth config
SECRET_KEY = "callpilot-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Pydantic models
class TenantCreate(BaseModel):
    name: str
    email: str
    password: str
    brand_name: Optional[str] = None

class TenantResponse(BaseModel):
    id: str
    name: str
    brand_name: Optional[str]
    email: str
    subscription_tier: str
    created_at: datetime

class ClientCreate(BaseModel):
    business_name: str
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    phone_number: Optional[str] = None
    greeting_message: Optional[str] = "Hello, you've reached our office. How can I help?"
    voice_personality: Optional[str] = "professional"
    services_offered: Optional[dict] = {}
    operating_hours: Optional[dict] = {}

class ClientResponse(BaseModel):
    id: str
    tenant_id: str
    business_name: str
    contact_name: Optional[str]
    contact_email: Optional[str]
    phone_number: Optional[str]
    greeting_message: str
    voice_personality: str
    status: str
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str
    tenant: TenantResponse

# Auth helpers
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_tenant(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        tenant_id: str = payload.get("sub")
        if tenant_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if tenant is None:
        raise credentials_exception
    return tenant

# Routes
@app.post("/register", response_model=Token)
def register(tenant_data: TenantCreate, db: Session = Depends(get_db)):
    existing = db.query(Tenant).filter(Tenant.email == tenant_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    tenant = Tenant(
        name=tenant_data.name,
        email=tenant_data.email,
        password_hash=get_password_hash(tenant_data.password),
        brand_name=tenant_data.brand_name or tenant_data.name,
    )
    db.add(tenant)
    db.commit()
    db.refresh(tenant)
    
    access_token = create_access_token(
        data={"sub": tenant.id},
        timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "tenant": tenant
    }

@app.post("/token", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    tenant = db.query(Tenant).filter(Tenant.email == form_data.username).first()
    if not tenant or not verify_password(form_data.password, tenant.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    access_token = create_access_token(
        data={"sub": tenant.id},
        timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "tenant": tenant
    }

@app.get("/me", response_model=TenantResponse)
def get_me(current_tenant: Tenant = Depends(get_current_tenant)):
    return current_tenant

# Clients
@app.get("/clients", response_model=List[ClientResponse])
def list_clients(
    current_tenant: Tenant = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    clients = db.query(Client).filter(Client.tenant_id == current_tenant.id).all()
    return clients

@app.post("/clients", response_model=ClientResponse)
def create_client(
    client_data: ClientCreate,
    current_tenant: Tenant = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    client = Client(
        tenant_id=current_tenant.id,
        business_name=client_data.business_name,
        contact_name=client_data.contact_name,
        contact_email=client_data.contact_email,
        contact_phone=client_data.contact_phone,
        phone_number=client_data.phone_number,
        greeting_message=client_data.greeting_message,
        voice_personality=client_data.voice_personality,
        services_offered=json.dumps(client_data.services_offered),
        operating_hours=json.dumps(client_data.operating_hours),
    )
    db.add(client)
    db.commit()
    db.refresh(client)
    return client

@app.get("/clients/{client_id}", response_model=ClientResponse)
def get_client(
    client_id: str,
    current_tenant: Tenant = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    client = db.query(Client).filter(
        Client.id == client_id,
        Client.tenant_id == current_tenant.id
    ).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client

@app.put("/clients/{client_id}", response_model=ClientResponse)
def update_client(
    client_id: str,
    client_data: ClientCreate,
    current_tenant: Tenant = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    client = db.query(Client).filter(
        Client.id == client_id,
        Client.tenant_id == current_tenant.id
    ).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    for key, value in client_data.dict().items():
        if value is not None and hasattr(client, key):
            setattr(client, key, value)
    
    db.commit()
    db.refresh(client)
    return client

@app.delete("/clients/{client_id}")
def delete_client(
    client_id: str,
    current_tenant: Tenant = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    client = db.query(Client).filter(
        Client.id == client_id,
        Client.tenant_id == current_tenant.id
    ).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    db.delete(client)
    db.commit()
    return {"message": "Client deleted"}

# Calls (for future)
@app.get("/calls")
def list_calls(
    client_id: Optional[str] = None,
    current_tenant: Tenant = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    query = db.query(Call).join(Client).filter(Client.tenant_id == current_tenant.id)
    if client_id:
        query = query.filter(Call.client_id == client_id)
    return query.order_by(Call.timestamp.desc()).limit(100).all()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
