# Feature-Based Architecture Guide

This project uses a **Feature-Based Architecture**, which is simpler and more maintainable than Clean Architecture. Each feature (auth, user, etc.) contains all related code in one place.

## Project Structure

```
src/
├── repositories/               # Data Access Layer (Repository Pattern)
│   ├── base.repository.ts     # Base interface & abstract class
│   ├── user.repository.ts     # User database operations
│   ├── token.repository.ts    # Token database operations
│   └── index.ts               # Export all repositories
│
├── features/                    # Feature modules
│   ├── auth/                   # Authentication feature
│   │   ├── models.ts          # Types, DTOs, interfaces
│   │   ├── services.ts        # Business logic (uses repositories & services)
│   │   ├── controllers.ts     # Request handlers
│   │   └── routes.ts          # Route definitions
│   ├── user/                  # User management feature (expandable)
│   │   ├── models.ts
│   │   ├── services.ts
│   │   ├── controllers.ts
│   │   └── routes.ts
│   └── (future features)
│
├── shared/                     # Shared utilities across features
│   ├── services/              # Utility services (no business logic)
│   │   ├── password.service.ts # Password hashing & validation
│   │   ├── token.service.ts    # Token generation & validation
│   │   └── index.ts
│   ├── middleware/            # Express middlewares
│   │   ├── AuthMiddleware.ts  # Authentication & token validation
│   │   ├── ErrorHandlingMiddleware.ts
│   │   └── index.ts
│   ├── utils/                 # Utility functions
│   │   ├── asyncHandler.ts    # Async error handling wrapper
│   │   ├── formatUptime.ts    # Time formatting
│   │   └── index.ts
│   ├── errors/                # Custom error classes
│   │   └── index.ts           # All error definitions
│   └── interfaces/            # Shared types & interfaces
│       └── index.ts
│
├── config/                    # Configuration & Setup
│   ├── app.ts                # Express app setup & initialization
│   ├── database.ts           # Prisma database client
│   └── index.ts
│
├── env.ts                    # Environment variables
└── index.ts                  # Entry point
```

## Why Feature-Based?

### Advantages:

1. **Simplicity** - Less boilerplate and easier to understand
2. **Locality** - All code related to a feature is in one place
3. **Maintainability** - Easy to find and modify feature-related code
4. **Scalability** - Simple to add new features as separate modules
5. **Reduced Complexity** - No need for multiple abstraction layers

### vs Clean Architecture:

- ❌ Clean Architecture has: domain → application → infrastructure → presentation (4 layers)
- ✅ Feature-Based has: features (models, services, controllers, routes) + shared utilities

## Repository Pattern & Data Access Layer

### Why Separate Repositories?

This project implements the **Repository Pattern** to separate data access logic from business logic:

1. **Single Responsibility** - Repositories only handle database operations
2. **Reusability** - Services can be tested independently of database
3. **Maintainability** - Database changes don't affect business logic
4. **Testability** - Easy to mock repositories for unit tests

### Layer Breakdown

```
┌─────────────────────────────────┐
│      Controllers (HTTP)         │
│  Handle requests & responses    │
├─────────────────────────────────┤
│   Services (Business Logic)     │
│  Orchestrate repositories &    │
│  utility services              │
├─────────────────────────────────┤
│   Repositories (Data Access)    │
│  Direct Prisma queries only    │
├─────────────────────────────────┤
│  Utility Services              │
│  (Password, Token - no I/O)    │
├─────────────────────────────────┤
│    Database (Prisma)           │
│      & External APIs           │
└─────────────────────────────────┘
```

### Repository Structure

**base.repository.ts** - Interface & abstract class

```typescript
export interface IRepository<T> {
  findById(id: string): Promise<T | null>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
  findAll(): Promise<T[]>;
}
```

**user.repository.ts** - User-specific operations

```typescript
export class UserRepository extends BaseRepository<User> {
  async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({ where: { email } });
  }
  // Only Prisma calls, no business logic
}
```

**token.repository.ts** - Token-specific operations

```typescript
export class TokenRepository extends BaseRepository<Token> {
  async findByToken(token: string): Promise<Token | null> {
    const hashedToken = this.tokenService.hashToken(token);
    return await prisma.userToken.findUnique({ where: { token: hashedToken } });
  }
  // Only Prisma calls, no business logic
}
```

### Services Using Repositories

```typescript
export class AuthService {
  private userRepository: UserRepository;
  private tokenRepository: TokenRepository;
  private passwordService: PasswordService;
  private tokenService: TokenService;

  async register(data: RegisterRequestDTO) {
    // Business logic: Check, validate, hash, save
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) throw new UserAlreadyExistsError();

    const hashedPassword = await this.passwordService.hash(data.password);
    return await this.userRepository.create({
      email: data.email,
      password: hashedPassword,
    });
  }
  // Only orchestrates repositories & services
}
```

### Utility Services (Shared)

These are **pure functions** with no database I/O:

**password.service.ts**

```typescript
export class PasswordService {
  async hash(password: string): Promise<string> {}
  async compare(password: string, hash: string): Promise<boolean> {}
}
```

**token.service.ts**

```typescript
export class TokenService {
  generateAccessToken(): string {}
  verifyAccessToken(token: string): boolean {}
  hashToken(token: string): string {}
}
```

## Feature Structure

### Authentication Feature (`src/features/auth/`)

**models.ts** - Type definitions and DTOs

```typescript
export interface RegisterRequestDTO {
  email: string;
  password: string;
  name?: string;
}
```

**services.ts** - All business logic consolidated

```typescript
export class AuthService {
  // Consolidates:
  // - PasswordService (password hashing)
  // - TokenService (token generation & validation)
  // - UserRepository (database operations)
  // - TokenRepository (token storage)
  // - RegisterUseCase, LoginUseCase, ProfileUseCase logic
}
```

**controllers.ts** - Request handlers

```typescript
export class AuthController {
  constructor(private authService: AuthService) {}

  async register(req, res) { ... }
  async login(req, res) { ... }
  async profile(req, res) { ... }
}
```

**routes.ts** - Route definitions

```typescript
export function createAuthRoutes(
  authController: AuthController,
  authMiddleware?: AuthMiddleware
): Router {
  // Define all auth routes
}
```

## Adding a New Feature

### Step 1: Create feature directory

```bash
mkdir src/features/newfeature
```

### Step 2: Create feature files

```
src/features/newfeature/
├── models.ts       # Types & interfaces
├── services.ts     # Business logic
├── controllers.ts  # Request handlers
└── routes.ts       # Route definitions
```

### Step 3: Update `src/config/app.ts`

```typescript
// Import the new feature
import { NewFeatureService } from '../features/newfeature/services.js';
import { NewFeatureController } from '../features/newfeature/controllers.js';
import { createNewFeatureRoutes } from '../features/newfeature/routes.js';

// Initialize service and controller
const newFeatureService = new NewFeatureService();
const newFeatureController = new NewFeatureController(newFeatureService);

// Add routes to API router
apiRouter.use('/newfeature', createNewFeatureRoutes(newFeatureController));
```

## Code Organization Tips

### 1. Keep services focused

- Consolidate related repositories and services into one
- Example: `AuthService` handles all auth-related database and business logic

### 2. Use constructor injection

```typescript
export class AuthController {
  constructor(private authService: AuthService) {}
}
```

### 3. Keep routes clean

```typescript
export function createAuthRoutes(
  authController: AuthController,
  authMiddleware?: AuthMiddleware
): Router {
  const router = ExpressRouter();

  router.post(
    '/register',
    asyncHandler((req, res) => authController.register(req, res))
  );

  return router;
}
```

### 4. Use shared utilities

```typescript
// For error handling
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// For middleware
export class AuthMiddleware {
  async authenticate(req, res, next) { ... }
  requireAuth(req, res, next) { ... }
}
```

## Database Setup

Uses **Prisma ORM** with **MariaDB**:

- `src/config/database.ts` - Prisma client configuration
- `prisma/schema.prisma` - Data model definitions
- `prisma/migrations/` - Database migrations

## Error Handling

Custom error classes in `src/shared/errors/index.ts`:

```typescript
export class UserAlreadyExistsError extends AppError {
  constructor(email: string) {
    super('USER_ALREADY_EXISTS', `User with email ${email} already exists`, 409);
  }
}
```

Errors are automatically caught by `ErrorHandlingMiddleware` and returned as JSON responses.

## Project Simplification

This feature-based architecture removes unnecessary abstraction layers:

✅ **Removed:**

- `src/application/` - Use cases consolidated into feature services
- `src/infrastructure/` - Repositories consolidated into feature services
- `src/presentation/` - Controllers moved into features
- `src/domain/` - Error classes moved to shared utilities

✅ **Result:**

- Cleaner project structure
- Easier to understand and maintain
- Less cognitive load (no 4-layer abstraction)
- Faster to add new features

2. Add new features using the template above

3. Consider splitting large services into separate concerns if needed

````

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
````

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
  app.use('/auth', createAuthRoutes(authController));
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
    private tokenService: ITokenService
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
    public readonly statusCode: number = 400
  ) {}
}

// Middleware catches and formats errors
export class ErrorHandlingMiddleware {
  static errorHandler(err: Error | DomainError, req, res, next) {
    const statusCode = 'statusCode' in err ? err.statusCode : 500;
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
app.use('/api/products', productRoutes);
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
