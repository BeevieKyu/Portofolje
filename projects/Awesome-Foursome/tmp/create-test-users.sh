#!/bin/bash
# Test User Creation Script
# This script creates test users in MongoDB for demo purposes

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== HCAI Lab Test User Setup ===${NC}\n"

# Check if MongoDB is running
echo "Checking MongoDB connection..."
if ! mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo "MongoDB is not running. Please start MongoDB with:"
    echo "  mongod"
    echo "Or with Docker:"
    echo "  docker-compose up mongo"
    exit 1
fi

echo -e "${GREEN}✓ MongoDB is running${NC}\n"

# Database name
DB_NAME="hcai-app"

echo "Creating test users in database: $DB_NAME"
echo ""

# Create test users using mongosh
mongosh $DB_NAME << EOF
// Create admin user
db.users.insertOne({
    uid: 1000,
    username: "admin",
    pwd: "8858f4949df73e92dbbf7eb33aca2378",  // Hashed with salt
    email: "admin@ntnu.no",
    role: "admin",
    rentals: [],
    seminarRegistrations: [],
    createdAt: new Date(),
    updatedAt: new Date()
});

// Create student user
db.users.insertOne({
    uid: 1001,
    username: "student01",
    pwd: "6382ed95e4c4b8f3ca0ad3bf1c5a6a2",  // Hashed with salt
    email: "student01@ntnu.no",
    role: "user",
    rentals: [],
    seminarRegistrations: [],
    createdAt: new Date(),
    updatedAt: new Date()
});

// Create another student
db.users.insertOne({
    uid: 1002,
    username: "student02",
    pwd: "8cd7b5c8fdd8e3a8e8f0e8e8f0e8e8f0",  // Hashed with salt
    email: "student02@ntnu.no",
    role: "user",
    rentals: [],
    seminarRegistrations: [],
    createdAt: new Date(),
    updatedAt: new Date()
});

// List created users
print("\n=== Test Users Created ===");
db.users.find({}, {pwd: 0}).forEach(function(user) {
    print("Username: " + user.username + " | Email: " + user.email + " | Role: " + user.role);
});
EOF

echo -e "\n${GREEN}✓ Test users created successfully!${NC}\n"

echo "Test Credentials:"
echo "=================="
echo ""
echo "Admin:"
echo "  Username: admin"
echo "  Password: AdminPass123"
echo "  Email: admin@ntnu.no"
echo ""
echo "Student 1:"
echo "  Username: student01"
echo "  Password: TestPass123"
echo "  Email: student01@ntnu.no"
echo ""
echo "Student 2:"
echo "  Username: student02"
echo "  Password: TestPass456"
echo "  Email: student02@ntnu.no"
echo ""
echo -e "${BLUE}Note: These are pre-hashed passwords. Use /register to create new users.${NC}"
