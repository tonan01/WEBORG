# TechShop - E-commerce Management System

TechShop is a full-stack e-commerce project designed to handle product management, user authentication, and order processing. The system is built with a focus on clean architecture, scalability, and seamless integration between a .NET Core API and a React frontend.

## Core Features

- User Authentication: Secure login, registration, and profile management using JWT tokens.
- Role-based Access Control: Admin and User roles with different permissions and dashboard views.
- Product Management: Full CRUD operations for products and categories.
- Cloud Image Uploads: Integration with Cloudinary for efficient product image storage and retrieval.
- Shopping Cart: Persistent cart functionality allowing users to manage items before checkout.
- Order System: Complete checkout flow, order history tracking, and administrative order status management.
- Admin Tools: Dedicated dashboard for statistics, user management (locking/unlocking accounts), and system oversight.

## Technology Stack

### Backend
- Framework: ASP.NET Core 8 Web API
- Database: Microsoft SQL Server
- ORM: Entity Framework Core
- Authentication: JWT (JSON Web Tokens)
- Libraries: AutoMapper, BCrypt.Net, CloudinaryDotNet, DotNetEnv

### Frontend
- Framework: React (Vite)
- State Management: React Hooks and Context API
- HTTP Client: Axios
- Styling: Vanilla CSS

## Project Architecture

The backend follows the Clean Architecture (Onion Architecture) pattern to ensure separation of concerns and maintainability:
- TechShop.Domain: Core entities and repository interfaces.
- TechShop.Application: Business logic, services, DTOs, and mapping profiles.
- TechShop.Infrastructure: Data persistence, migrations, and external service implementations (Cloudinary).
- TechShop.API: Controller endpoints, middleware, and dependency injection configuration.

## Getting Started

### Prerequisites
- .NET 8 SDK
- Node.js (v18+)
- SQL Server

### Backend Setup
1. Navigate to the `TechShop/TechShop.API` directory.
2. Create a `.env` file based on the provided `.env.example`.
3. Configure your SQL Server connection string and Cloudinary credentials.
4. Run migrations and start the server:
   ```bash
   dotnet restore
   dotnet run
   ```
   The database will be automatically created and seeded on the first run.

### Frontend Setup
1. Navigate to the `TechShop/techshop-frontend` directory.
2. Create a `.env` file based on `.env.example` and set `VITE_API_URL`.
3. Install dependencies and start the development server:
   ```bash
   npm install
   npm run dev
   ```

## Configuration

Refer to the `.env.example` files in both `TechShop.API` and `techshop-frontend` folders for the required environment variables:
- Database Connection String
- JWT Key, Issuer, and Audience
- Cloudinary Cloud Name, API Key, and API Secret
- Backend API URL for the Frontend
