from app.database import SessionLocal
from app.models import User


db = SessionLocal()

try:
    users = db.query(User).all()

    print("Database connection successful!")
    print(f"Users found: {len(users)}")

    for user in users:
        print(user.id, user.email, user.role)

finally:
    db.close()