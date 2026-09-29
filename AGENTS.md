# AI Agent Instructions - Boilerplate Backend

This document serves as the primary guideline for AI Agents working on this repository. Follow these rules and the defined architecture strictly.

## 1. Project Overview
This is a **NestJS Monorepo Boilerplate** built with **pnpm Workspaces** and **Turborepo**. The architecture is designed for scalability and code sharing between multiple applications.

## 2. Tech Stack
- **Package Manager**: pnpm (Always use `pnpm`, never `npm` or `yarn`).
- **Orchestrator**: Turborepo (`turbo`).
- **Backend Framework**: NestJS.
- **Database**: Prisma ORM.
- **Validation**: Zod (via `nestjs-zod` or similar).
- **Language**: TypeScript.
- **Compiler**: SWC (Speedy Web Compiler) for fast builds and development.

## 3. Application Architecture
This boilerplate uses two types of application structures based on their purpose:

### A. NestJS Applications (e.g., `apps/api`)
- Used for HTTP services and complex frameworks.
- Has a local `src/prisma/` folder containing a Global `PrismaModule` and `PrismaService`.
- Uses Dependency Injection for database access.

### B. Plain TypeScript Applications (e.g., `apps/schedulers`, `apps/workers`)
- Used for background jobs and scheduled tasks to keep them lightweight.
- Does NOT use NestJS or Dependency Injection.
- Accesses the database by directly importing `getPrisma()` from `@repo/shared/infrastructure/database/client`.
- Entry point is usually `src/index.ts` and run via `tsx`.

## 4. Repository Structure
- `apps/`: Main applications (e.g., `api`, `pos`, `schedulers`, `workers`).
- `packages/shared/`: The core shared library containing business logic and database access.
- `turbo.json`: Pipeline configuration.

## 5. Development Workflow (Layered Pattern)
When implementing a new feature or entity, follow this specific sequence in `@repo/shared`:

1.  **Prisma Schema**: Define or update the data model in `packages/shared/src/prisma/schema/`.
2.  **Repository**: Implement data access logic in `packages/shared/src/infrastructure/repository/`.
3.  **Schemas**: Define validation and DTO schemas (using Zod) in `packages/shared/src/schemas/`.
4.  **Entities**: Define domain or response entities in `packages/shared/src/entities/`.
5.  **Selects**: Define Prisma selection objects in `packages/shared/src/selects/` for consistent data fetching.
6.  **Application Logic**: Finally, implement Services and Controllers in the respective `apps/` directory.
7.  **Unit Testing**: Create unit tests for every new feature.
    - Focus on **Services** and **Repositories**.
    - Test files must be located in the same directory as the implementation with the `.spec.ts` suffix.
    - Ensure a high test coverage for business logic.

### Entity Implementation Pattern (Example: `roles` table)
Entities reside in `packages/shared/src/entities/` and define response/domain payload types derived from Prisma selection objects defined in `packages/shared/src/selects/`.

*Example (`packages/shared/src/entities/role.entity.ts`)*:
```typescript
import type { Prisma } from "#generated/client";
import { roleSelect } from "../selects/role.select";

// Tipe balikan untuk satu objek Role
export type RoleEntity = Prisma.RoleGetPayload<{
  select: typeof roleSelect;
}>;

// Tipe balikan jika datanya berupa Array (untuk list)
export type RoleListEntity = RoleEntity[];
```

## 7. Operational Rules

### A. Dependency Management
- Use the `--filter` flag to manage dependencies for specific packages.
  - *Example*: `pnpm add zod --filter @repo/shared`
- Use `workspace:*` for internal dependencies.

### B. Naming Conventions
- Internal packages/apps must use the `@repo/` prefix in `package.json`.
- File naming: use kebab-case (e.g., `role.repository.ts`, `role.schema.ts`).

### C. Import Guidelines
- **Prisma Client**: Always import from `#generated/client` (not `@prisma/client`).
- **Shared Package**: Use sub-path aliases like `@repo/shared/schemas/role.schema` instead of long relative paths.
- **Type vs Value**: 
    - Use `import type { ... }` for interfaces, types, and Prisma payloads.
    - Use regular `import { ... }` for **Classes (DTOs)**, Services, and Repositories to ensure NestJS metadata reflection works.
- **Sub-path Exports**: Use the defined patterns in `package.json` for all internal imports.

### D. Prisma Multi-file Schema Pattern
- Use Prisma's multi-file schema feature (Prisma 5.15+).
- The main configuration resides in `packages/shared/src/prisma/schema.prisma`.
- The main configuration must be minimalist: no `url` in `datasource` and use `provider = "prisma-client"`.
- Individual models MUST be placed in `packages/shared/src/prisma/schema/*.prisma`.
- **Naming Conventions**: Use `snake_case` for database fields and plural names for models (e.g., `Roles`).
- **Database Types**: Always use explicit database types (e.g., `@db.Uuid`, `@db.Timestamp`, `@db.VarChar`).
- **Mandatory Inspection**: Before implementing any repository or logic, the AI MUST inspect the entire `packages/shared/src/prisma/schema/` directory to understand the complete data model and relationships.

### E. Modular NestJS Architecture
- Use feature modules for every domain (e.g., `RoleModule` for `Role`).
- Every feature folder in `apps/*/src/` MUST contain its own `.module.ts` file.
- **Inter-module Communication**: If a service needs to call logic from another module, import that module in the current module's `imports` array and the main `AppModule`.
- Always export services that are needed by other modules in the `exports` array.

## 8. API Documentation (Scalar)
- API documentation is served using **Scalar** for a cleaner, more modern interface.
- We rely on **Single Source of Truth** from Zod schemas for most of the documentation.
- Controllers still use minimal decorators from `@nestjs/swagger` to structure the document:
    - `@ApiTags('Category')`: Group endpoints by domain.
    - `@ApiOperation({ summary: '...' })`: Brief explanation of the endpoint.
- **Do NOT** use `@ApiResponse` manually for examples unless absolutely necessary, as it clutters the controller. Let Scalar infer it from the Zod DTOs.
- Documentation is accessible at `/api` (Scalar UI) and `/api-json` (OpenAPI JSON).

## 9. Advanced Documentation & Standards

### A. DTO-Driven Documentation (Zod)
- Do NOT use `@ApiProperty` manually in controllers.
- **Mandatory**: Use Zod's `.describe("...")` for every field in `packages/shared/src/schemas/`.
- `nestjs-zod` will automatically convert these descriptions into Swagger schemas.

### B. API Documentation Standards (Scalar)
- **Endpoint Explanations**: EVERY endpoint MUST have clear documentation using `@ApiOperation({ summary: '...' })`. Explain what the endpoint does clearly.
- **DTO Documentation (SSOT)**: Always use `.describe("...")` in Zod schemas. This is the **Single Source of Truth**. `nestjs-zod` will convert this to OpenAPI format, and Scalar will render it beautifully.
- **Response Examples**:
    - Because we use Zod as SSOT, avoid cluttering Controllers with `@ApiResponse` manual examples. 
    - The API UI is powered by `@scalar/nestjs-api-reference` initialized in `main.ts`.
- **Neatness**: Documentation must be neat, descriptive, and accurately reflect business logic natively from the schemas.

### C. Module Resolution & Export Standards
- **Internal Aliases**: Use the `#` alias (Node.js subpath imports) for internal imports within the `shared` package (e.g., `#generated/client`).
- **Workspace Exports**: Use `@repo/shared/*` for cross-package imports. 
- **No Extensions**: Do NOT use `.js` or `.ts` extensions in imports.
- **Automatic Aliasing (*)**: We use a catch-all pattern in `packages/shared/package.json`. 
    - **How it works**: Any folder inside `packages/shared/src/` is automatically accessible.
    - **Example**: If you create `src/services/mail.ts`, you can import it as `@repo/shared/services/mail` (from apps) or `#services/mail` (within shared).
- **Manual Alias Addition**: If you need a specific alias outside the catch-all:
    1.  Add to `packages/shared/package.json` in both `exports` and `imports` fields.
    2.  Add to `apps/*/tsconfig.json` in the `paths` field to ensure the IDE/Compiler recognizes it.
    3.  Restart TypeScript Server in VS Code.

### D. Response Consistency
- **ResponseHelper**: Always use `ResponseHelper` from `@repo/shared/http/response` to ensure all API responses follow the `{ status, message, data, code }` pattern.

## 10. Testing & Frontend Handoff

### A. Testing Standards
- **Rigorous Unit Testing**: When writing unit tests (e.g., Jest `.spec.ts`), it is **MANDATORY** to create extensive test cases. 
    - Do not only test the "happy path" (successful cases).
    - You must actively write tests for **edge cases**, negative scenarios, and hard-to-detect bugs (e.g., handling nulls, unexpected inputs, database transaction failures, and boundary values).
    - Mocking must be precise and cover all possible outcomes of external dependencies.

### B. Frontend Handoff & Documentation
- **Mandatory Feature Docs**: Upon completion of ANY new feature, you are **MANDATORY** to create a Markdown (`.md`) documentation file inside the `docs/` folder (e.g., `docs/feature-name-implementation.md`).
- **Content Requirements**: This document must serve as a clear, detailed, and comprehensive guide for the Frontend Developer, including:
    - Endpoints available (Methods and URLs).
    - Request expectations (Headers, Params, Query, Body with examples).
    - Response structure (Success and Error variations with exact JSON examples).
    - Step-by-step implementation flow/logic for the frontend side.
    - Any edge cases or validation rules the frontend needs to handle.

## 11. Implementation Workflow
- **Granular Errors**: Validation responses MUST include which field failed and why.
- **Format**:
    ```json
    {
      "status": "error",
      "code": 400,
      "message": "Validation failed",
      "errors": [
        { "field": "email", "message": "Invalid email format" }
      ]
    }
    ```
- **Security Exception**: For **Auth-related** modules (Login/Register), use general error messages (e.g., "Invalid credentials") without pointing to specific fields to prevent enumeration attacks.

## 12. Operational Commands (From Root)
Always run these commands from the project root:
- **Install Dependencies**: `pnpm install`
- **Generate Prisma Client**: `pnpm prisma:generate`
- **Database Migration**: `pnpm prisma:migrate`
- **Run Development**: `pnpm dev`
- **Build All**: `pnpm build`

## 13. Coding Standards & AI Behavior
- **Zero Linter Errors**: Your code MUST pass all linter checks (`biome check`). There should be absolutely NO linter warnings or errors.
- **Strict TypeScript**: NEVER use the `any` type under any circumstances. You must define interfaces, types, or use generics properly.
- **Modular Design**: If logic is potentially reusable across apps, it MUST live in `packages/shared`.
- **Test-Driven Mindset**: Every feature implementation is considered incomplete without its corresponding unit tests.
- **Atomic Operations**: Perform changes in logical steps (e.g., update schema first, then repository).
- **Verification**: Always run `pnpm install` and verify Prisma generation after schema changes.

---
*Note: Adhere strictly to the established layered architecture and modular patterns in this repository for all new feature implementations.*

## 14. Frontend Architecture (apps/web)

This monorepo includes a Frontend application built with Vite and React, located in `apps/web`. When working on the frontend, adhere to the following stack and rules:

### A. Tech Stack
- **Framework**: React 18+ (via Vite).
- **Language**: TypeScript (Strict mode).
- **Routing**: `@tanstack/react-router` for type-safe routing.
- **State Management & Fetching**: `@tanstack/react-query` for server state.
- **Styling**: Tailwind CSS.
- **UI Components**: `shadcn/ui` (accessible, customizable components).
- **Forms**: `react-hook-form`.
- **Validation**: `zod` (integrated with React Hook Form using `@hookform/resolvers/zod`).

### B. Directory Structure (`apps/web/src`)
- `assets/`: Static assets like images and global CSS.
- `components/`: Generic, reusable UI components (e.g., shadcn/ui components).
- `features/`: Domain-specific modules containing their own components, hooks, api calls, and state (e.g., `features/auth`).
- `hooks/`: Global custom React hooks.
- `lib/`: Utility functions (e.g., `utils.ts` for tailwind class merging).
- `routes/`: TanStack Router file-based routing components.

### C. Development Guidelines
- **Component Design**: Favor functional components with hooks. Keep components small and focused.
- **Data Fetching**: Always use TanStack Query for remote data fetching. Do not use `useEffect` for data fetching.
- **Form Handling**: Use React Hook Form for all forms. Validate all inputs using Zod schemas before submission.
- **Styling**: Use Tailwind CSS utility classes. For complex conditional classes, use the `cn` utility (`clsx` + `tailwind-merge`) found in `lib/utils.ts`.
- **Routing**: Define routes in the `src/routes` directory following TanStack Router conventions (`__root.tsx`, `index.tsx`, etc.). Use loaders for critical data fetching before rendering the route.
- **Environment Variables**: NEVER hardcode API URLs. Always use `VITE_API_URL` from `.env` files.
- **API Integration**: All remote network calls must go through a centralized API client wrapper (e.g., `lib/api.ts`) that automatically prepends the `VITE_API_URL` and attaches necessary headers (like Authorization tokens). Direct `fetch` or `axios` calls scattering URLs across components are strictly forbidden.