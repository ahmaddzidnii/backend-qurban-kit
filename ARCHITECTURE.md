# Clean Architecture Guide

This project has been refactored to follow **Clean Architecture** principles. This guide explains the structure and how to work with it.

## Project Structure

```
src/
├── domain/                      # Enterprise Business Rules (Entities & Errors)
│   ├── entities/               # Core business entities
│   │   └── User.ts            # User entity interface
│   └── errors/                # Domain-specific error classes
│       └── DomainError.ts      # Custom error hierarchy
│
├── application/                # Application Business Rules (Use Cases)
│   ├── use-cases/             # Business logic orchestration
│   │   ├── auth/
│   │   │   ├── RegisterUseCase.ts
│   │   │   ├── LoginUseCase.ts
│   │   │   ├── RefreshTokenUseCase.ts
│   │   │   ├── LogoutUseCase.ts
│   │   │   └── index.ts
│   │   └── (other use cases)
│   ├── dto/                   # Data Transfer Objects
│   │   └── AuthDTO.ts
│   └── interfaces/            # Repository & Service abstractions
│       ├── IUserRepository.ts
│       ├── ITokenService.ts
│       └── IPasswordService.ts
│
├── infrastructure/            # External dependencies & frameworks
│   ├── repositories/         # Database implementations
│   │   ├── UserRepository.ts
│   │   ├── RefreshTokenRepository.ts
│   │   └── index.ts
│   └── services/            # External service implementations
│       ├── TokenService.ts
│       ├── PasswordService.ts
│       └── index.ts
│
├── presentation/             # Controllers, Routes, Middleware, Views
│   ├── controllers/          # Request handlers
│   │   ├── AuthController.ts
│   │   └── index.ts
│   ├── routes/              # Route definitions
│   │   ├── AuthRoutes.ts
│   │   ├── ApiRoutes.ts
│   │   └── index.ts
│   ├── middleware/          # Express middlewares
│   │   ├── AuthMiddleware.ts
│   │   ├── ErrorHandlingMiddleware.ts
│   │   └── index.ts
│   └── validators/          # Request validation schemas
│       └── AuthValidator.ts
│
├── config/                  # Configuration & Dependency Injection
│   ├── app.ts              # App factory function
│   ├── database.ts         # Database setup
│   └── index.ts
│
├── utils/                   # Utility functions
│   ├── asyncHandler.ts     # Async error handling wrapper
│   └── index.ts
│
├── interfaces/              # Shared response interfaces
│   ├── error-response.ts
│   └── message-response.ts
│
├── app.ts                   # (Old file - can be removed)
├── env.ts                   # Environment configuration
├── index.ts                 # Entry point
└── middlewares.ts          # (Old file - can be removed)
```

## Architecture Layers Explanation

### 1. **Domain Layer** (`domain/`)
- Contains core business rules and entities
- Independent of any framework or external library
- Defines error classes for domain-specific exceptions
- No dependencies on other layers

**Example:**
```typescript
// domain/entities/User.ts
export interface User {
  id: string;
  email: string;
  password: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

// domain/errors/DomainError.ts
export class InvalidCredentialsError extends DomainError {
  constructor() {
    super("INVALID_CREDENTIALS", "Invalid email or password", 401);
  }
}
```

### 2. **Application Layer** (`application/`)
- Contains use cases (business logic orchestration)
- Defines interfaces for repositories and services (contracts)
- Uses DTOs for data transfer between layers
- Depends only on domain layer

**Example:**
```typescript
// application/use-cases/auth/LoginUseCase.ts
export class LoginUseCase {
  constructor(
    private userRepository: IUserRepository,
    private tokenService: ITokenService,
  ) {}

  async execute(data: LoginRequestDTO): Promise<AuthResponseDTO> {
    // Business logic here
  }
}
```

### 3. **Infrastructure Layer** (`infrastructure/`)
- Implements repository and service interfaces
- Handles external dependencies (database, authentication services, etc.)
- Depends on application and domain layers
- Easily replaceable (e.g., swap Prisma with TypeORM)

**Example:**
```typescript
// infrastructure/repositories/UserRepository.ts
export class UserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({ where: { email } });
  }
}

// infrastructure/services/TokenService.ts
export class TokenService implements ITokenService {
  generateAccessToken(payload: JWTPayload): string {
    return jwt.sign(payload, env.JWT_SECRET);
  }
}
```

### 4. **Presentation Layer** (`presentation/`)
- Handles HTTP requests and responses
- Contains controllers, routes, and middleware
- Validates incoming requests
- Depends on application layer

**Components:**
- **Controllers**: Handle requests and delegate to use cases
- **Routes**: Define API endpoints
- **Middleware**: Handle authentication, error handling, logging
- **Validators**: Validate request data using Zod schemas

**Example:**
```typescript
// presentation/controllers/AuthController.ts
export class AuthController {
  async register(req: Request, res: Response) {
    const data = registerSchema.parse(req.body);
    const result = await this.registerUseCase.execute(data);
    res.status(201).json(result);
  }
}
```

### 5. **Config Layer** (`config/`)
- Dependency injection setup
- Application factory function
- Configuration management
- Database initialization

**Example:**
```typescript
// config/app.ts
export function createApp(): Express {
  // Initialize repositories
  const userRepository = new UserRepository();
  
  // Initialize services
  const tokenService = new TokenService();
  
  // Initialize use cases
  const loginUseCase = new LoginUseCase(userRepository, tokenService);
  
  // Initialize controllers
  const authController = new AuthController(loginUseCase);
  
  // Setup app and routes
  const app = express();
  app.use("/auth", createAuthRoutes(authController));
  return app;
}
```

## Data Flow

```
Request
  ↓
Middleware (Authentication, Error Handling)
  ↓
Controller (Parse Request & Validate)
  ↓
Use Case (Business Logic)
  ↓
Repository (Database Operations)
  ↓
Response (via Middleware)
```

## Dependency Injection Pattern

The application uses **constructor injection** for managing dependencies:

```typescript
export class LoginUseCase {
  constructor(
    private userRepository: IUserRepository,
    private tokenService: ITokenService,
  ) {}
}
```

Dependencies are created in `config/app.ts`:
```typescript
const userRepository = new UserRepository();
const tokenService = new TokenService();
const loginUseCase = new LoginUseCase(userRepository, tokenService);
```

## Error Handling

Errors are handled hierarchically:

```typescript
// Domain errors with status codes
export class DomainError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 400,
  ) {}
}

// Middleware catches and formats errors
export class ErrorHandlingMiddleware {
  static errorHandler(err: Error | DomainError, req, res, next) {
    const statusCode = ("statusCode" in err) ? err.statusCode : 500;
    res.status(statusCode).json({ message: err.message, code: err.code });
  }
}
```

## Testing Strategy

Each layer can be tested independently:

```typescript
// Test use case without database
const mockRepository = {
  findByEmail: jest.fn().mockResolvedValue(null),
};
const useCase = new RegisterUseCase(mockRepository, mockTokenService, mockPasswordService);
const result = await useCase.execute(data);

// Test controller with mocked use case
const mockUseCase = { execute: jest.fn() };
const controller = new AuthController(mockUseCase);
await controller.register(mockRequest, mockResponse);
```

## Adding New Features

### 1. Create Domain Entity
```typescript
// domain/entities/Product.ts
export interface Product {
  id: string;
  name: string;
  price: number;
}
```

### 2. Create Domain Errors (if needed)
```typescript
// domain/errors/ProductError.ts
export class ProductNotFoundError extends DomainError {}
```

### 3. Create Application Interfaces
```typescript
// application/interfaces/IProductRepository.ts
export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  create(data: CreateProductDTO): Promise<Product>;
}
```

### 4. Create Use Cases
```typescript
// application/use-cases/product/CreateProductUseCase.ts
export class CreateProductUseCase {
  constructor(private productRepository: IProductRepository) {}
  async execute(data: CreateProductDTO): Promise<Product> {
    // Business logic
  }
}
```

### 5. Create Repository Implementation
```typescript
// infrastructure/repositories/ProductRepository.ts
export class ProductRepository implements IProductRepository {
  async create(data: CreateProductDTO): Promise<Product> {
    return await prisma.product.create({ data });
  }
}
```

### 6. Create Controller
```typescript
// presentation/controllers/ProductController.ts
export class ProductController {
  constructor(private createProductUseCase: CreateProductUseCase) {}
  async create(req: Request, res: Response) {
    const result = await this.createProductUseCase.execute(req.body);
    res.status(201).json(result);
  }
}
```

### 7. Register in App Config
```typescript
// config/app.ts
const productRepository = new ProductRepository();
const createProductUseCase = new CreateProductUseCase(productRepository);
const productController = new ProductController(createProductUseCase);
const productRoutes = createProductRoutes(productController);
app.use("/api/products", productRoutes);
```

## Benefits of Clean Architecture

✅ **Testability** - Each layer can be tested independently
✅ **Maintainability** - Clear separation of concerns
✅ **Flexibility** - Easy to swap implementations
✅ **Scalability** - Easy to add new features
✅ **Readability** - Code is self-documenting
✅ **Dependency Management** - Inversion of control

## Migration Notes

Old files that can be removed:
- `src/app.ts` - Now `src/config/app.ts`
- `src/middlewares.ts` - Now `src/presentation/middleware/`
- `src/api/` - Now `src/presentation/routes/` and `src/presentation/controllers/`
- `src/lib/` - Now `src/infrastructure/services/` and logic in `src/application/use-cases/`

## Resources

- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/)
- [Express.js Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
