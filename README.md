# Dynamic Knowledge Base System

A RESTful API for managing interconnected topics and resources with version control, user roles, and permissions. This system implements complex business logic, advanced OOP concepts, design patterns, and algorithms while maintaining high code quality and testing standards.

## Features

- **Topic Management**

  - CRUD operations with version control
  - Hierarchical topic structure with parent-child relationships
  - Version history tracking with ability to retrieve specific versions
  - Recursive topic tree retrieval
  - Shortest path finding between topics

- **Resource Management**

  - Link external resources to topics
  - Support for various resource types (video, article, pdf)
  - Resource metadata tracking

- **User Management**
  - Role-based access control (Admin, Editor, Viewer)
  - JWT-based authentication
  - User registration and login

## Technical Stack

- **Backend Framework**: NestJS with TypeScript
- **Database**: SQLite (for development)
- **Authentication**: JWT with Passport
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest
- **Logging**: Pino
- **Containerization**: Docker

## Prerequisites

- Node.js (v20 or higher)
- pnpm
- Docker and Docker Compose (for containerized deployment)

## Installation

1. Clone the repository:

   ```bash
   git clone git@github.com:leonardorochaf/project-mark-challenge.git
   cd project-mark-challenge
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

## Running the Application

### Local Development

1. Start the development server:

   ```bash
   pnpm start:dev
   ```

2. The API will be available at `http://localhost:3000/api`
3. Swagger documentation will be available at `http://localhost:3000/docs`

### Docker Deployment

1. Build and start the containers:

   ```bash
   docker-compose up --build
   ```

2. The API will be available at `http://localhost:3000/api`

## Testing

Run the test suite:

```bash
# Unit tests
pnpm test

# Test coverage
pnpm test:cov
```

## API Endpoints

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/login` - User login

### Topics

- `GET /topics` - List all root topics
- `GET /topics/:id` - Get a specific topic (with optional version parameter)
- `POST /topics` - Create a new topic (Admin, Editor)
- `PATCH /topics/:id` - Update a topic (Admin, Editor)
- `DELETE /topics/:id` - Delete a topic (Admin only)
- `GET /topics/:id/tree` - Get topic tree structure (Admin, Editor)
- `GET /topics/:startId/path/:endId` - Find shortest path between topics (Admin, Editor)

### Resources

- `POST /topics/:topicId/resources` - Create a new resource for a topic (Admin, Editor)
- `DELETE /topics/:topicId/resources/:id` - Delete a resource (Admin only)

## Architecture

The application follows a modular architecture with the following components:

- **Controllers**: Handle HTTP requests and responses
- **Services**: Implement business logic
- **Models**: Define data structures and relationships
- **Repositories**: Handle data persistence
- **Middlewares**: Process requests (auth, validation, etc.)
- **DTOs**: Data Transfer Objects for request/response validation
