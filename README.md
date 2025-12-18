# Woldia University Library Management System

## Project Overview
The Woldia University Library Management System (LMS) is a web-based application designed to efficiently manage library operations. 
The system allows administrators to manage books and users,
and enables library users to borrow and return books in a structured and timely manner.

 Features

 Admin Functionality
- Add, update, and delete books in the system
- Manage users and assign roles
- Full control over system operations
- View analytics and dashboards

User Functionality
- Borrow books
- Return books within the due date
- View available books


 Project Structure

| Component | Technology/Tool | Description |
|-----------|----------------|-------------|
| Backend | Spring Boot | Handles business logic, APIs, and database integration |
| Frontend | React.js | User interface for both admin and users |
| Database | PostgreSQL | Stores books, users, and transaction data |
| Tools | GitHub | Version control and team collaboration |
| Tools | Postman | API testing and verification |

---

## Team Members

| No. | Name | University ID |
|-----|------|---------------|
| 1 | Yohannes Alemayehu | 1303096 |
| 2 | Abel Asefa | 1300419 |
| 3 | Thomas Tesema | 1302870 |
| 4 | Kedir Tahir | 1301743 |
| 5 | Biruk Girma | 1300655 |



 Getting Started

  Prerequisites
- Java JDK 21
- Node.js 18+
- PostgreSQL 14+
- Git

  Setup Backend
1. Navigate to backend folder:
  bash
cd se-webservices
spring.datasource.url=jdbc:postgresql://localhost:5432/your-db-name
spring.datasource.username=your_db_user
spring.datasource.password=your_db_password

 frontend
npm install
npm run dev
