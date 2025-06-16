import os
from app.database import Base, engine
from app.models import Word, Phonetic, Meaning, Definition, User
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext

# Create database tables
print("Creating database tables...")
Base.metadata.create_all(bind=engine)

# Create a default admin user
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

# Check if admin user already exists
admin = db.query(User).filter(User.email == "admin@example.com").first()
if not admin:
    print("Creating default admin user...")
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    admin_user = User(
        email="admin@example.com",
        username="admin",
        hashed_password=pwd_context.hash("admin123"),
        is_superuser=True
    )
    db.add(admin_user)
    db.commit()
    print("Default admin user created!")
    print("Email: admin@example.com")
    print("Password: admin123")
else:
    print("Admin user already exists")

db.close()
print("Database initialization complete!")
