import stripe
from fastapi import Request
from fastapi import FastAPI, Depends, HTTPException, Header, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from jose import jwt
from datetime import timedelta, datetime
from django.contrib.auth.hashers import PBKDF2PasswordHasher

from app.database import get_db
from app.models import (
    User,
    Product,
    ProductImage,
    Cart,
    Order,
    OrderItem,
    Payment,
    Notification
)

app = FastAPI(title="Smart E-Commerce API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    await manager.connect(user_id, websocket)

    try:
        while True:
            await websocket.receive_text()

    except WebSocketDisconnect:
        manager.disconnect(user_id)

SECRET_KEY = "change-this-to-a-long-random-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
import os

STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

stripe.api_key = STRIPE_SECRET_KEY

security = HTTPBearer()

class ConnectionManager:
    def __init__(self):
        self.active_connections = {}

    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: int):
        self.active_connections.pop(user_id, None)

    async def send_to_user(self, user_id: int, message: dict):
        websocket = self.active_connections.get(user_id)

        if websocket:
            await websocket.send_json(message)


manager = ConnectionManager()

# -------------------------
# Request Schemas
# -------------------------

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class AdminLoginRequest(BaseModel):
    username: str
    password: str

class AddToCartRequest(BaseModel):
    product_id: int
    quantity: int = 1

class PaymentRequest(BaseModel):
    payment_method: str

class AdminUserRequest(BaseModel):
    password: str
    name: str
    email: EmailStr
    username: str
    role: str = "customer"

# -------------------------
# Password Hasher
# -------------------------

password_hasher = PBKDF2PasswordHasher()

def create_access_token(data: dict):
    to_encode = data.copy()

    expire = datetime.now() + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({
        "exp": expire
    })

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


# -------------------------
# Root Endpoint
# -------------------------

@app.get("/")
def root():
    return {
        "message": "Smart E-Commerce API is running"
    }


# -------------------------
# Database Test
# -------------------------

@app.get("/db-test")
def database_test(db: Session = Depends(get_db)):
    users = db.query(User).all()

    return {
        "database": "connected",
        "users_count": len(users)
    }


# -------------------------
# User Registration
# -------------------------

@app.post("/auth/register")
def register(
    user_data: RegisterRequest,
    db: Session = Depends(get_db)
):
    # Check whether email already exists
    existing_user = (
        db.query(User)
        .filter(User.email == user_data.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # Generate Django-compatible password hash
    hashed_password = password_hasher.encode(
        user_data.password,
        password_hasher.salt(),
    )

    # Create new customer
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        username=user_data.email,
        password=hashed_password,
        first_name="",
        last_name="",
        is_superuser=False,
        is_staff=False,
        is_active=True,
        date_joined=datetime.now(),
        role="customer",
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "Registration successful",
        "user_id": new_user.id,
        "email": new_user.email,
        "role": new_user.role,
    }


# -------------------------
# User Login
# -------------------------

@app.post("/auth/login")
def login(
    user_data: LoginRequest,
    db: Session = Depends(get_db)
):
    # Find user by email
    user = (
        db.query(User)
        .filter(User.email == user_data.email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # Check whether account is active
    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="User account is inactive"
        )

    # Verify password
    try:
        password_valid = password_hasher.verify(
            user_data.password,
            user.password
        )
    except ValueError:
        password_valid = False

    if not password_valid:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "email": user.email,
            "role": user.role,
        }
    )

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "email": user.email,
        "role": user.role,
    }

class GoogleUserRequest(BaseModel):
    email: EmailStr
    name: str
    auth0_id: str


@app.post("/auth/google")
def google_auth(
    data: GoogleUserRequest,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        username = data.email.split("@")[0]

        existing_username = (
            db.query(User)
            .filter(User.username == username)
            .first()
        )

        if existing_username:
            username = f"{username}_{data.auth0_id[-6:]}"

        user = User(
            name=data.name,
            email=data.email,
            username=username,
            password="!",
            role="customer",
            is_superuser=False,
            is_staff=False,
            is_active=True,
            first_name=data.name,
            last_name="",
            date_joined=datetime.now()
        )

        db.add(user)
        db.commit()
        db.refresh(user)

    access_token = create_access_token(
        {
            "sub": str(user.id),
            "email": user.email,
            "role": user.role
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@app.post("/auth/admin-login")
def admin_login(
    login_data: AdminLoginRequest,
    db: Session = Depends(get_db)
):
    user = (
        db.query(User)
        .filter(User.username == login_data.username)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    hasher = PBKDF2PasswordHasher()

    if not hasher.verify(login_data.password, user.password):
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    if user.role not in ["admin", "staff"]:
        raise HTTPException(
            status_code=403,
            detail="Admin access denied"
        )

    access_token = create_access_token({
        "sub": str(user.id),
        "username": user.username,
        "email": user.email,
        "role": user.role,
    })

    return {
        "message": "Admin login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
    }


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return payload

from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Product, Order

@app.get("/admin/dashboard")
def admin_dashboard(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.get("role") not in ["admin", "staff"]:
        raise HTTPException(
            status_code=403,
            detail="Admin access denied"
        )

    total_users = db.query(User).count()
    total_products = db.query(Product).count()
    total_orders = db.query(Order).count()

    paid_orders = (
        db.query(Order)
        .filter(Order.payment_status == "paid")
        .all()
    )

    total_sales = sum(
        float(order.total) for order in paid_orders
    )

    low_stock_products = (
        db.query(Product)
        .filter(Product.stock <= 5)
        .order_by(Product.stock.asc())
        .all()
    )

    order_items = db.query(OrderItem).all()

    product_sales = {}

    for item in order_items:
        product_sales[item.product_id] = (
            product_sales.get(item.product_id, 0)
            + item.quantity
        )

    top_selling_products = []

    for product_id, quantity in product_sales.items():
        product = (
            db.query(Product)
            .filter(Product.id == product_id)
            .first()
        )

        if product:
            top_selling_products.append({
                "product_id": product.id,
                "product_name": product.name,
                "quantity_sold": quantity
            })

    top_selling_products.sort(
        key=lambda x: x["quantity_sold"],
        reverse=True
    )

    recent_orders = (
        db.query(Order)
        .order_by(Order.timestamp.desc())
        .limit(5)
        .all()
    )

    return {
        "total_users": total_users,
        "total_products": total_products,
        "total_orders": total_orders,
        "total_sales": total_sales,
        "top_selling_products": top_selling_products[:5],
        "low_stock_products": [
            {
                "id": product.id,
                "name": product.name,
                "stock": product.stock
            }
            for product in low_stock_products
        ],
        "recent_orders": recent_orders
    }


class AdminProductRequest(BaseModel):
    name: str
    description: str
    price: float
    stock: int
    category: str
    popularity: int = 0


@app.post("/admin/products")
def create_admin_product(
    product_data: AdminProductRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.get("role") not in ["admin", "staff"]:
        raise HTTPException(
            status_code=403,
            detail="Admin access denied"
        )

    if product_data.price < 0:
        raise HTTPException(
            status_code=400,
            detail="Price cannot be negative"
        )

    if product_data.stock < 0:
        raise HTTPException(
            status_code=400,
            detail="Stock cannot be negative"
        )

    new_product = Product(
        name=product_data.name,
        description=product_data.description,
        price=product_data.price,
        stock=product_data.stock,
        category=product_data.category,
        popularity=product_data.popularity
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return {
        "message": "Product created successfully",
        "product": new_product
    }

@app.put("/admin/products/{product_id}")
def update_admin_product(
    product_id: int,
    product_data: AdminProductRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.get("role") not in ["admin", "staff"]:
        raise HTTPException(status_code=403, detail="Admin access denied")

    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if product_data.price < 0:
        raise HTTPException(status_code=400, detail="Price cannot be negative")

    if product_data.stock < 0:
        raise HTTPException(status_code=400, detail="Stock cannot be negative")

    product.name = product_data.name
    product.description = product_data.description
    product.price = product_data.price
    product.stock = product_data.stock
    product.category = product_data.category
    product.popularity = product_data.popularity

    db.commit()
    db.refresh(product)

    return {
        "message": "Product updated successfully",
        "product": product
    }

@app.delete("/admin/products/{product_id}")
def delete_admin_product(
    product_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.get("role") not in ["admin", "staff"]:
        raise HTTPException(status_code=403, detail="Admin access denied")

    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    db.delete(product)
    db.commit()

    return {
        "message": "Product deleted successfully",
        "product_id": product_id
    }

@app.get("/admin/users")
def get_admin_users(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.get("role") not in ["admin", "staff"]:
        raise HTTPException(
            status_code=403,
            detail="Admin access denied"
        )

    users = db.query(User).order_by(User.id.desc()).all()

    return {
        "users": [
            {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "username": user.username,
                "role": user.role,
                "is_active": user.is_active,
            }
            for user in users
        ]
    }

@app.post("/admin/users")
def create_admin_user(
    user_data: AdminUserRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.get("role") not in ["admin", "staff"]:
        raise HTTPException(
            status_code=403,
            detail="Admin access denied"
        )

    if user_data.role not in ["customer", "staff", "admin"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid role"
        )

    existing_email = db.query(User).filter(
        User.email == user_data.email
    ).first()

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    existing_username = db.query(User).filter(
        User.username == user_data.username
    ).first()

    if existing_username:
        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )

    hasher = PBKDF2PasswordHasher()
    hashed_password = hasher.encode(user_data.password, hasher.salt())

    new_user = User(
        password=hashed_password,
        username=user_data.username,
        first_name="",
        last_name="",
        is_superuser=False,
        is_staff=False,
        is_active=True,
        date_joined=datetime.now(),
        name=user_data.name,
        email=user_data.email,
        role=user_data.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User created successfully",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "username": new_user.username,
            "role": new_user.role
        }
    }

@app.put("/admin/users/{user_id}")
def update_admin_user(
    user_id: int,
    user_data: AdminUserRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.get("role") not in ["admin", "staff"]:
        raise HTTPException(
            status_code=403,
            detail="Admin access denied"
        )

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if user_data.role not in ["customer", "staff", "admin"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid role"
        )

    user.name = user_data.name
    user.email = user_data.email
    user.username = user_data.username
    user.role = user_data.role

    if user_data.password:
        hasher = PBKDF2PasswordHasher()
        user.password = hasher.encode(
            user_data.password,
            hasher.salt()
        )

    db.commit()
    db.refresh(user)

    return {
        "message": "User updated successfully",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "username": user.username,
            "role": user.role
        }
    }

@app.delete("/admin/users/{user_id}")
def delete_admin_user(
    user_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only admins can delete users"
        )

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if user.id == int(current_user["sub"]):
        raise HTTPException(
            status_code=400,
            detail="You cannot delete your own admin account"
        )

    db.delete(user)
    db.commit()

    return {
        "message": "User deleted successfully",
        "user_id": user_id
    }

@app.get("/admin/orders")
def get_admin_orders(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.get("role") not in ["admin", "staff"]:
        raise HTTPException(
            status_code=403,
            detail="Admin access denied"
        )

    orders = (
        db.query(Order)
        .order_by(Order.timestamp.desc())
        .all()
    )

    result = []

    for order in orders:
        user = db.query(User).filter(
            User.id == order.user_id
        ).first()

        result.append({
            "id": order.id,
            "user_id": order.user_id,
            "customer_name": user.name if user else "",
            "customer_email": user.email if user else "",
            "total": float(order.total),
            "payment_status": order.payment_status,
            "order_status": order.order_status,
            "timestamp": order.timestamp
        })

    return {
        "orders": result
    }

@app.put("/admin/orders/{order_id}/status")
async def update_admin_order_status(
    order_id: int,
    status: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.get("role") not in ["admin", "staff"]:
        raise HTTPException(
            status_code=403,
            detail="Admin access denied"
        )

    order = db.query(Order).filter(
        Order.id == order_id
    ).first()

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    allowed_statuses = [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled"
    ]

    if status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid order status"
        )

    order.order_status = status

    # Create notification for shipping-related updates
    if status in ["shipped", "delivered"]:
        db.add(
            Notification(
                user_id=order.user_id,
                type="shipping",
                message=f"Order #{order.id} status updated to {status}.",
                is_read=False,
                timestamp=datetime.now()
            )
        )

    db.commit()
    db.refresh(order)

    await manager.send_to_user(
        order.user_id,
        {
            "type": "order_status_update",
            "order_id": order.id,
            "order_status": order.order_status
        }
    )

    return {
        "message": "Order status updated successfully",
        "order_id": order.id,
        "order_status": order.order_status
    }

@app.get("/auth/me")
def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "message": "Authenticated user",
        "user": current_user
    }

@app.post("/cart")
def add_to_cart(
    cart_data: AddToCartRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    product = (
        db.query(Product)
        .filter(Product.id == cart_data.product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    if cart_data.quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Quantity must be greater than 0"
        )

    if cart_data.quantity > product.stock:
        raise HTTPException(
            status_code=400,
            detail="Insufficient stock"
        )

    user_id = int(current_user["sub"])

    existing_cart_item = (
        db.query(Cart)
        .filter(
            Cart.user_id == user_id,
            Cart.product_id == cart_data.product_id
        )
        .first()
    )

    if existing_cart_item:
        new_quantity = existing_cart_item.quantity + cart_data.quantity

        if new_quantity > product.stock:
            raise HTTPException(
                status_code=400,
                detail="Insufficient stock"
            )

        existing_cart_item.quantity = new_quantity
    else:
        new_cart_item = Cart(
            user_id=user_id,
            product_id=cart_data.product_id,
            quantity=cart_data.quantity
        )

        db.add(new_cart_item)

    db.commit()

    return {
        "message": "Product added to cart",
        "product_id": product.id,
        "quantity": cart_data.quantity
    }

@app.get("/cart")
def get_cart(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = int(current_user["sub"])

    cart_items = (
        db.query(Cart, Product)
        .join(Product, Cart.product_id == Product.id)
        .filter(Cart.user_id == user_id)
        .all()
    )

    cart = []

    for cart_item, product in cart_items:
        cart.append({
            "cart_id": cart_item.id,
            "product_id": product.id,
            "name": product.name,
            "description": product.description,
            "price": float(product.price),
            "quantity": cart_item.quantity,
            "stock": product.stock,
            "category": product.category,
        })

    return {
        "cart": cart
    }

@app.put("/cart/{product_id}")
def update_cart(
    product_id: int,
    cart_data: AddToCartRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = int(current_user["sub"])

    cart_item = (
        db.query(Cart)
        .filter(
            Cart.user_id == user_id,
            Cart.product_id == product_id
        )
        .first()
    )

    if not cart_item:
        raise HTTPException(
            status_code=404,
            detail="Product not found in cart"
        )

    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    if cart_data.quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Quantity must be greater than 0"
        )

    if cart_data.quantity > product.stock:
        raise HTTPException(
            status_code=400,
            detail="Insufficient stock"
        )

    cart_item.quantity = cart_data.quantity

    db.commit()

    return {
        "message": "Cart updated successfully",
        "product_id": product_id,
        "quantity": cart_item.quantity
    }

@app.delete("/cart/{product_id}")
def remove_from_cart(
    product_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = int(current_user["sub"])

    cart_item = (
        db.query(Cart)
        .filter(
            Cart.user_id == user_id,
            Cart.product_id == product_id
        )
        .first()
    )

    if not cart_item:
        raise HTTPException(
            status_code=404,
            detail="Product not found in cart"
        )

    db.delete(cart_item)
    db.commit()

    return {
        "message": "Product removed from cart",
        "product_id": product_id
    }

@app.post("/orders")
def create_order(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = int(current_user["sub"])

    cart_items = (
        db.query(Cart)
        .filter(Cart.user_id == user_id)
        .all()
    )

    if not cart_items:
        raise HTTPException(
            status_code=400,
            detail="Cart is empty"
        )

    total = 0
    order_items_data = []

    for cart_item in cart_items:
        product = (
            db.query(Product)
            .filter(Product.id == cart_item.product_id)
            .first()
        )

        if not product:
            raise HTTPException(
                status_code=404,
                detail=f"Product {cart_item.product_id} not found"
            )

        if cart_item.quantity > product.stock:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for {product.name}"
            )

        item_total = product.price * cart_item.quantity
        total += item_total

        order_items_data.append({
            "product": product,
            "quantity": cart_item.quantity,
            "price": product.price
        })

    new_order = Order(
    user_id=user_id,
    total=total,
    payment_status="pending",
    order_status="pending",
    timestamp=datetime.now()
    )

    db.add(new_order)
    db.flush()

    for item in order_items_data:
        order_item = OrderItem(
            order_id=new_order.id,
            product_id=item["product"].id,
            quantity=item["quantity"],
            price=item["price"]
        )

        db.add(order_item)

        item["product"].stock -= item["quantity"]

    for cart_item in cart_items:
        db.delete(cart_item)

    db.add(
        Notification(
            user_id=user_id,
            type="order",
            message=f"Order #{new_order.id} has been placed successfully.",
            is_read=False,
            timestamp=datetime.now()
        )
    )

    db.commit()
    db.refresh(new_order)

    return {
        "message": "Order created successfully",
        "order_id": new_order.id,
        "total": new_order.total,
        "payment_status": new_order.payment_status,
        "order_status": new_order.order_status
    }

@app.get("/orders")
def get_orders(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = int(current_user["sub"])

    orders = (
        db.query(Order)
        .filter(Order.user_id == user_id)
        .order_by(Order.timestamp.desc())
        .all()
    )

    return {
        "orders": orders
    }

@app.get("/orders/{order_id}")
def get_order_details(
    order_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = int(current_user["sub"])

    order = (
        db.query(Order)
        .filter(
            Order.id == order_id,
            Order.user_id == user_id
        )
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    order_items = (
        db.query(OrderItem, Product)
        .join(Product, OrderItem.product_id == Product.id)
        .filter(OrderItem.order_id == order.id)
        .all()
    )
    items = []

    for item, product in order_items:
        items.append({
            "id": item.id,
            "product_id": product.id,
            "product_name": product.name,
            "description": product.description,
            "category": product.category,
            "quantity": item.quantity,
            "price": float(item.price),
            "subtotal": float(item.price * item.quantity),
        })

    return {
        "order": order,
        "items": items
    }

@app.post("/payments/{order_id}")
def create_payment(
    order_id: int,
    payment_data: PaymentRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = int(current_user["sub"])

    order = (
        db.query(Order)
        .filter(
            Order.id == order_id,
            Order.user_id == user_id
        )
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    if order.payment_status == "paid":
        raise HTTPException(
            status_code=400,
            detail="Order is already paid"
        )

    payment = Payment(
        order_id=order.id,
        amount=order.total,
        payment_method=payment_data.payment_method,
        status="pending",
        timestamp=datetime.now()
    )

    db.add(payment)
    db.commit()
    db.refresh(payment)

    return {
        "message": "Payment created",
        "payment_id": payment.id,
        "order_id": order.id,
        "amount": payment.amount,
        "payment_method": payment.payment_method,
        "status": payment.status
    }

@app.put("/payments/{payment_id}")
def update_payment_status(
    payment_id: int,
    status: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = int(current_user["sub"])

    payment = (
        db.query(Payment)
        .join(Order, Payment.order_id == Order.id)
        .filter(
            Payment.id == payment_id,
            Order.user_id == user_id
        )
        .first()
    )

    if not payment:
        raise HTTPException(
            status_code=404,
            detail="Payment not found"
        )

    if status not in ["success", "failed"]:
        raise HTTPException(
            status_code=400,
            detail="Status must be success or failed"
        )

    payment.status = status

    if status == "success":
        order = (
            db.query(Order)
            .filter(Order.id == payment.order_id)
            .first()
        )

        if order:
            order.payment_status = "paid"
    else:
        order = (
            db.query(Order)
            .filter(Order.id == payment.order_id)
            .first()
        )

        if order:
            order.payment_status = "failed"

    db.commit()
    db.refresh(payment)

    return {
        "message": "Payment status updated",
        "payment_id": payment.id,
        "order_id": payment.order_id,
        "payment_status": payment.status,
        "order_payment_status": order.payment_status
    }

@app.post("/payments/{order_id}/checkout")
def create_stripe_checkout(
    order_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = int(current_user["sub"])

    order = (
        db.query(Order)
        .filter(
            Order.id == order_id,
            Order.user_id == user_id
        )
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    if order.payment_status == "paid":
        raise HTTPException(
            status_code=400,
            detail="Order is already paid"
        )

    order_items = (
        db.query(OrderItem, Product)
        .join(Product, OrderItem.product_id == Product.id)
        .filter(OrderItem.order_id == order.id)
        .all()
    )

    line_items = []

    for item, product in order_items:
        line_items.append({
            "price_data": {
                "currency": "inr",
                "product_data": {
                    "name": product.name
                },
                "unit_amount": int(item.price * 100)
            },
            "quantity": item.quantity
        })

    try:
        checkout_session = stripe.checkout.Session.create(
            line_items=line_items,
            mode="payment",
            success_url="http://localhost:5173/payment-success",
            cancel_url="http://localhost:5173/payment-cancelled",
            metadata={
                "order_id": str(order.id),
                "user_id": str(user_id)
            }
        )

        return {
            "checkout_url": checkout_session.url,
            "session_id": checkout_session.id,
            "order_id": order.id
        }

    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

@app.post("/stripe/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload,
            sig_header,
            STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]

        order_id = session.metadata["order_id"] if "order_id" in session.metadata else None

        if not order_id:
            return {"received": True}

        if order_id:
            db = next(get_db())

            try:
                order = (
                    db.query(Order)
                    .filter(Order.id == int(order_id))
                    .first()
                )

                if order:
                    order.payment_status = "paid"
                    order.order_status = "confirmed"

                    payment = (
                        db.query(Payment)
                        .filter(Payment.order_id == order.id)
                        .order_by(Payment.id.desc())
                        .first()
                    )

                    if payment:
                        payment.status = "success"
                        payment.transaction_id = session.get("payment_intent")

                    db.add(
                        Notification(
                            user_id=order.user_id,
                            type="payment",
                            message=f"Payment for Order #{order.id} was successful.",
                            is_read=False,
                            timestamp=datetime.now()
                        )
                    )

                    db.commit()

            finally:
                db.close()

    return {"received": True}


@app.get("/products")
def get_products(
    category: str | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    db: Session = Depends(get_db)
):
    query = db.query(Product)

    if category:
        query = query.filter(Product.category == category)

    if min_price is not None:
        query = query.filter(Product.price >= min_price)

    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    products = query.order_by(Product.popularity.desc()).all()

    result = []

    for product in products:
        images = (
            db.query(ProductImage)
            .filter(ProductImage.product_id == product.id)
            .all()
        )

        result.append({
            "id": product.id,
            "name": product.name,
            "description": product.description,
            "price": product.price,
            "stock": product.stock,
            "category": product.category,
            "popularity": product.popularity,
            "created_at": product.created_at,
            "images": [
                image.image for image in images
            ]
        })

    return {
        "products": result
    }

@app.get("/notifications")
def get_notifications(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = int(current_user["sub"])

    notifications = (
        db.query(Notification)
        .filter(Notification.user_id == user_id)
        .order_by(Notification.timestamp.desc())
        .all()
    )

    return {"notifications": notifications}

@app.put("/orders/{order_id}/status")
async def update_order_status(
    order_id: int,
    status: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = int(current_user["sub"])

    order = (
        db.query(Order)
        .filter(Order.id == order_id, Order.user_id == user_id)
        .first()
    )

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    allowed_statuses = [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled"
    ]

    if status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid order status"
        )

    order.order_status = status

    if status in ["shipped", "delivered"]:
        db.add(
            Notification(
                user_id=user_id,
                type="shipping",
                message=f"Order #{order.id} status updated to {status}.",
                is_read=False,
                timestamp=datetime.now()
            )
        )

    db.commit()
    db.refresh(order)

    await manager.send_to_user(
        user_id,
        {
            "type": "order_status_update",
            "order_id": order.id,
            "order_status": order.order_status
        }
    )

    return {
        "message": "Order status updated successfully",
        "order_id": order.id,
        "order_status": order.order_status
    }

