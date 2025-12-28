# Woldia University Library Management System

  ## Project Overview

The Woldia University Library Management System (LMS) is a web-based application designed to efficiently manage library operations. 
The system allows administrators to manage books and users,
and enables library users to borrow and return books in a structured and timely manner.

  ## Features

Admin Functionality
  
- Add, update, and delete books.
  
- and manage user roles (ADMIN, LIBRARIAN, USER).
  
- Activate/deactivate users.
  
- Reset user passwords.
  
- Access a detailed dashboard with statistics.

User Functionality

- View available books – Browse the library collection.

- Borrow and return books.

- Access digital materials.

- View borrowing history and penalties.

 ## 🗂 Project Structure
  
   Frontend (frontend/)

  React.js application for user interface.

        
         frontend/                       # React.js frontend application
         ├── public/                     # Public static files
         │   ├── index.html
         │   └── favicon.ico
         ├── src/
         │   ├── assets/                 # Images, logos, icons
         │   │   ├── home.jpeg
         │   │   ├── library.jpg
         │   │   ├── library2.jpeg
         │   │   ├── library3.jpeg
         │   │   ├── logo.png
         │   │   └── react.svg
         │   ├── components/             # Reusable components
         │   │   └── Navbar.jsx
         │   ├── pages/                  # Full page views
         │   │   ├── AddBook.jsx
         │   │   ├── AdminDashboard.jsx
         │   │   ├── AssignRole.jsx
         │   │   ├── AuthContext.jsx
         │   │   ├── AuthPage.jsx
         │   │   ├── Books.jsx
         │   │   ├── Borrow.jsx
         │   │   ├── Customer.jsx
         │   │   ├── DigitalMaterial.jsx
         │   │   ├── Home.jsx
         │   │   ├── Material.jsx
         │   │   ├── Penalty.jsx
         │   │   └── RetunBook.jsx
         │   ├── routes/                 # Route management
         │   │   └── ProtectedRoute.jsx
         │   ├── App.jsx                  # Root component
         │   ├── main.jsx                 # Entry point
         │   └── index.css                # Global styles
         ├── .env
         ├── .gitignore
         └── eslint.config.js
      
      
   Backend (backend/)

  Spring Boot application for API and business logic.
  

         backend/                        # Spring Boot backend application
         ├── src/main/java/org/wldu/webservices/
         │   ├── config/                 # Security and system configuration
         │   │   ├── SecurityConfig.java
         │   │   └── WebConfig.java
         │   ├── controller/             # REST endpoints aligned with frontend
         │   │   ├── AdminController.java      # Admin pages: AddBook, AssignRole, AdminDashboard
         │   │   ├── AuthController.java       # AuthPage, AuthContext
         │   │   ├── BookController.java       # Books, Borrow, ReturnBook
         │   │   ├── CustomerController.java   # Customer page
         │   │   └── MaterialController.java   # DigitalMaterial, Material
         │   ├── service/                # Business logic
         │   │   ├── AdminService.java
         │   │   ├── AuthService.java
         │   │   ├── BookService.java
         │   │   ├── CustomerService.java
         │   │   └── MaterialService.java
         │   ├── repository/             # JPA Repositories
         │   │   ├── UserRepository.java
         │   │   ├── BookRepository.java
         │   │   ├── BorrowRepository.java
         │   │   ├── CustomerRepository.java
         │   │   └── MaterialRepository.java
         │   ├── entity/                 # Database models
         │   │   ├── User.java
         │   │   ├── Book.java
         │   │   ├── Borrow.java
         │   │   ├── Customer.java
         │   │   ├── Material.java
         │   │   └── Penalty.java
         │   ├── dto/                    # Data Transfer Objects
         │   │   ├── UserDTO.java
         │   │   ├── BookDTO.java
         │   │   ├── BorrowDTO.java
         │   │   ├── CustomerDTO.java
         │   │   └── MaterialDTO.java
         │   └── WebservicesApplication.java   # Spring Boot main class
         └── pom.xml
      
      
  Database (database/)

  SQL scripts for schema and sample data.

       database/
        ├── LMS_DB.sql                  # Main schema and seed data
        └── seed_data/
            └── books_seed.sql          # Sample book data
  
 ## 🛠 Technology Stack & Tools
      
| Component | Technology/Tool | Description |
|-----------|----------------|-------------|
| Backend | Spring Boot | Handles business logic, APIs, and database integration |
| Frontend | React.js | User interface for both admin and users |
| Database | PostgreSQL | Stores books, users, and transaction data |
| Tools | GitHub | Version control and team collaboration |
| Tools | Postman | API testing and verification |

  ## API Endpoints

   Books
   
|Method                   	|Endpoint                               	|Description                                      |Auth |                   
|--------------------------|----------------------------------------|-------------------------------------------------|------|
|GET	                      |/api/books	                             | List  all books (pagination, sorting, search)	  | USER / ADMIN / LIBRARIAN|
|POST	                     | /api/books/addbook	                    |Add a new book	                                  | ADMIN only|
|PUT	                      | /api/books/{id}	                       |Update book information	                         |ADMIN only|
|DELETE	                   | /api/books/{id}	                       |Delete a book	                                   | ADMIN only|

   Authentication

|Method                     	|Endpoint                            	|Description|
|----------------------------|-------------------------------------|-----------|
|POST	                       |/api/auth/login                      |	User login|
|POST                       	|/api/auth/register	                  |User registration|

   User Management

|Method	                   |Endpoint                               	|Description                        |	Auth |
|--------------------------|----------------------------------------|-----------------------------------|------|
|GET	                      |/api/user/getAllUsers	                  | List all users	                   | ADMIN only|
|PUT	                      | /api/user/assign-role	                 | Assign/change a user's role	      | ADMIN only|
|PUT	                      |/api/user/revoke-role                  	|Revoke a role	                     |ADMIN only|
|PUT                       |	/api/user/toggle-activation/{id}	      | Activate/deactivate user	         | ADMIN only|
|PUT	                      |/api/user/reset-password/{id}	          |Reset user password	               |ADMIN only|

   🔐 Security

JWT-based authentication.

Role-based access control.

Password hashing using BCrypt.

Public endpoints: login and registration.

---

 ## 👥Team Members

| No. | Name | University ID |
|-----|------|---------------|
| 1 | Yohannes Alemayehu | 1303096 |
| 2 | Abel Assefa | 1300419 |
| 3 | Thomas Tesema | 1302870 |
| 4 | Kedir Tahir | 1301743 |
| 5 | Biruk Girma | 1300655 |



  ## Getting Started

 Prerequisites

- Before running the project, make sure you have the following installed on your machine:

- Java JDK 21 – Required for Spring Boot backend

- Node.js 18+ – Required for React.js frontend

- PostgreSQL 14+ – Database for storing books, users, and transactions

- Git – Version control

 ## Backend Setup

   1. Navigate to the backend folder:

           cd backend


   2. Configure the database connection in application.properties or application.yml:

          spring.datasource.url=jdbc:postgresql://localhost:5432/your_db_name
   
          spring.datasource.username=your_db_user
   
          spring.datasource.password=your_db_password


   3. Install dependencies and run the backend:

          ./mvnw clean install
          ./mvnw spring-boot:run


   backend API will start at: http://localhost:8081 (or the configured port).

## Frontend Setup

  1.Navigate to the frontend folder:

        cd frontend

  2.Install dependencies:

       npm install


  3.Run the development server:

      npm run dev


   frontend will be available at: http://localhost:5173 (Vite default port).
