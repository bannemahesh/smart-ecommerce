from sqlalchemy import Column, Integer, BigInteger, String, Text, Numeric, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base


class User(Base):
    __tablename__ = "users_user"

    id = Column(BigInteger, primary_key=True)
    password = Column(String(128), nullable=False)
    last_login = Column(DateTime, nullable=True)

    is_superuser = Column(Boolean, nullable=False)
    username = Column(String(150), nullable=False, unique=True)
    first_name = Column(String(150), nullable=False)
    last_name = Column(String(150), nullable=False)

    is_staff = Column(Boolean, nullable=False)
    is_active = Column(Boolean, nullable=False)

    date_joined = Column(DateTime, nullable=False)
    name = Column(String(150), nullable=False)
    email = Column(String(254), nullable=False, unique=True)
    role = Column(String(20), nullable=False)

class Product(Base):
    __tablename__ = "products_product"

    id = Column(BigInteger, primary_key=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    stock = Column(Integer, nullable=False)
    category = Column(String(100), nullable=False)
    popularity = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

class ProductImage(Base):
    __tablename__ = "products_productimage"

    id = Column(BigInteger, primary_key=True)
    image = Column(String(100), nullable=False)
    product_id = Column(
        BigInteger,
        ForeignKey("products_product.id"),
        nullable=False
    )


class Cart(Base):
    __tablename__ = "orders_cart"

    id = Column(BigInteger, primary_key=True)
    user_id = Column(Integer, ForeignKey("users_user.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products_product.id"), nullable=False)
    quantity = Column(Integer, nullable=False)

class Order(Base):
    __tablename__ = "orders_order"

    id = Column(BigInteger, primary_key=True)
    total = Column(Numeric(10, 2), nullable=False)
    payment_status = Column(String(20), nullable=False)
    order_status = Column(String(20), nullable=False)
    timestamp = Column(DateTime, nullable=False)
    user_id = Column(
        BigInteger,
        ForeignKey("users_user.id"),
        nullable=False
    )

class OrderItem(Base):
    __tablename__ = "orders_orderitem"

    id = Column(BigInteger, primary_key=True)
    quantity = Column(Integer, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)

    order_id = Column(
        BigInteger,
        ForeignKey("orders_order.id"),
        nullable=False
    )

    product_id = Column(
        BigInteger,
        ForeignKey("products_product.id"),
        nullable=False
    )

class Payment(Base):
    __tablename__ = "orders_payment"

    id = Column(BigInteger, primary_key=True)
    amount = Column(Numeric(10, 2), nullable=False)
    payment_method = Column(String(50), nullable=False)
    transaction_id = Column(String(255), unique=True, nullable=True)
    status = Column(String(20), nullable=False)
    timestamp = Column(DateTime, nullable=False)

    order_id = Column(
        BigInteger,
        ForeignKey("orders_order.id"),
        nullable=False
    )

class Notification(Base):
    __tablename__ = "notifications_notification"

    id = Column(BigInteger, primary_key=True)
    type = Column(String(20), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, nullable=False)
    timestamp = Column(DateTime, nullable=False)

    user_id = Column(
        BigInteger,
        ForeignKey("users_user.id"),
        nullable=False
    )