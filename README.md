# Smart E-Commerce Platform

A full-stack Smart E-Commerce Platform built with React, FastAPI, Django, MySQL, and Stripe.

## Project Overview

The platform allows customers to browse products, manage their cart, place orders, make online payments, and track order status.

Administrators can manage users, products, orders, and store statistics through an admin panel.

## Features

### Customer

- User registration and login
- JWT authentication
- Google authentication with Auth0
- Browse products
- Filter products by category and price
- Product popularity sorting
- Add products to cart
- Update cart quantities
- Remove products from cart
- Create orders
- Stripe Checkout payments
- Order history
- Order details
- Real-time order status updates
- Notifications

### Admin

- Admin authentication
- Dashboard
- User management
- Product management
- Order management
- Update order status
- Sales statistics
- Product and user statistics
- Recent orders

## Technology Stack

### Frontend

- React
- React Router
- Tailwind CSS
- Auth0

### Backend

- FastAPI
- Django
- SQLAlchemy
- Django ORM
- JWT
- Stripe

### Database

- MySQL

### Payment

- Stripe Checkout
- Stripe Test Mode

## Project Structure

```text
smart-ecommerce/
│
├── backend/
│   ├── fastapi/
│   │   ├── venv/
│   │   └── app/
│   │
│   └── django/
│       ├── manage.py
│       ├── admin_panel/
│       ├── users/
│       ├── products/
│       ├── orders/
│       └── notifications/
│
├── frontend/
│
├── database/
│
├── docs/
│
├── postman/
│
├── .gitignore
└── README.md