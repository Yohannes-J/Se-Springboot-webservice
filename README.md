# Woldia University Library Management System

  # Overview
The University Digital Library Management System is a web-based application designed to manage physical books, non-book materials, and digital resources in a university library.
It supports book borrowing and returning, tracks book availability, and handles penalties directly within the borrowing process.
This system is designed based on a clear ER (Entity–Relationship) model to ensure data consistency, scalability, and ease of implementation using Spring Boot (Backend) and React (Frontend).


# Objectives
Manage library customers (students, staff, admins)
Register and manage physical books
Handle borrowing and returning of books
Track penalties for late returns, lost books, and damaged pages
Manage physical non-book materials
Provide access to digital materials for reading and downloading


# Core Entities and Description
1. Customer
Represents users of the library system.
Attributes:
id
name
email
role (STUDENT, STAFF, ADMIN)
created_at
Description:
A customer can borrow multiple books and access digital materials.
#2. Book
Represents physical books available in the library.
Attributes:
id
title
isbn
category
published_year
total_copies
available_copies
updated_at
Description:
Tracks inventory and availability of physical books.
#3.  Borrow
Acts as the central transaction entity connecting customers and books.
Attributes:
id
customer_id (FK)
book_id (FK)
borrow_date
due_date
return_date
status (BORROWED, RETURNED, LOST)
late_return (YES/NO)
broken_page (YES/NO)
lost_book (YES/NO)
penalty_amount
Description:
Handles borrowing, returning, and penalty calculation.
Penalty logic is intentionally embedded in this entity to simplify system design.
#4. Material
Represents books and non-books physical resources in the library.
Examples:
Tables
Chairs
Computers
Magazines
Newspapers
Attributes:
id
name
category
location
borrowable (YES/NO)
description
image
Description:
Used for inventory and asset tracking purposes.
#5. Digital Material
Represents electronic library resources.
Attributes:
id
title
file_type (PDF, PPT, DOC)
description
readable (YES/NO)
downloadable (YES/NO)
file_url
updated_at
Description:
Allows users to read and download digital content online.
Entity Relationships
One Customer can borrow many Books
One Book can be borrowed many times
The Borrow entity resolves the many-to-many relationship
Penalties are managed directly in the Borrow entity
Materials and Digital Materials are managed independently


 # Features

# Admin Functionality
  
- Add, update, and delete books.
  
- and manage user roles (ADMIN, LIBRARIAN, USER).
  
- Activate/deactivate users.
  
- Reset user passwords.
  
- Access a detailed dashboard with statistics.

# User Functionality

- View available books – Browse the library collection.

- Borrow and return books.

- Access digital materials.

- View borrowing history and penalties.

  
 # Technology Stack & Tools
      
| Component | Technology/Tool | Description |
|-----------|----------------|-------------|
| Backend | Spring Boot | Handles business logic, APIs, and database integration |
| Frontend | React.js | User interface for both admin and users |
| Database | PostgreSQL | Stores books, users, and transaction data |
| Tools | GitHub | Version control and team collaboration |
| Tools | Postman | API testing and verification.

 # Team Members

| No. | Name | University ID |
|-----|------|---------------|
| 1 | Yohannes Alemayehu | 1303096 |
| 2 | Abel Assefa | 1300419 |
| 3 | Thomas Tesema | 1302870 |
| 4 | Kedir Tahir | 1301743 |
| 5 | Biruk Girma | 1300655 |



  ## Getting Started

# Prerequisites

- Before running the project, make sure you have the following installed on your machine:

- Java JDK 21 – Required for Spring Boot backend

- Node.js 18+ – Required for React.js frontend

- PostgreSQL 18+ – Database 

- Git – Version control

 Backend Setup

   1. Navigate to the backend folder:

           cd backend


   2. Configure the database connection in application.properties or application.yml:

          spring.datasource.url=jdbc:postgresql://localhost:5432/your_db_name
   
          spring.datasource.username=your_db_user
   
          spring.datasource.password=your_db_password


   3. Install dependencies and run the backend:

          ./mvnw clean install
          ./mvnw spring-boot:run


   backend API will start at: https://localhost:8081 (or the configured port).

## Frontend Setup

  1.Navigate to the frontend folder:

        cd frontend

  2.Install dependencies:

       npm install


  3.Run the development server:

      npm run dev


   frontend will be available at: http://localhost:5173 (Vite default port).




swagger url
https://localhost:8081/swagger-ui/index.html
