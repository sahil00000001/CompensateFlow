# Overview

The Increment Process Automation System is a comprehensive web-based performance management platform designed for hierarchical organizations. This system manages annual employee performance reviews, ratings, and salary increments across a structured organizational hierarchy. The application supports role-based access control with five distinct levels (Founder, L1-L3 Managers, and Peers across four categories), ensuring appropriate data isolation and approval workflows.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side is built using **React 18** with **TypeScript** and utilizes modern tooling for development. The architecture follows component-based patterns with the following key decisions:

- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Query (TanStack Query) for server state management and caching
- **UI Framework**: Radix UI primitives with custom styling via Tailwind CSS and shadcn/ui components
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Styling**: Tailwind CSS with CSS variables for theming support

The component structure separates concerns into dashboard components, form components, layout components, and UI primitives, providing maintainable and reusable code.

## Backend Architecture
The server-side uses **Node.js** with **Express.js** following a RESTful API pattern:

- **Runtime**: Node.js with ESM modules
- **Framework**: Express.js for HTTP server and routing
- **Database Layer**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit's OpenID Connect (OIDC) with session management
- **Email Service**: SendGrid for automated notifications
- **File Structure**: Modular architecture with separate concerns for routes, storage, and services

The API provides endpoints for user management, review cycles, employee reviews, feedback collection, and dashboard analytics with role-based access controls.

## Data Storage Solutions
The system uses **PostgreSQL** as the primary database with the following design decisions:

- **ORM**: Drizzle ORM chosen for type safety and performance
- **Database Provider**: Neon Database for serverless PostgreSQL hosting
- **Schema Design**: Hierarchical user structure with referential integrity
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Migration Strategy**: Drizzle Kit for schema migrations

Key entities include users with hierarchical relationships, review cycles, employee reviews, feedback, meetings, appeals, and activity logs.

## Authentication and Authorization
Authentication is handled through **Replit's OIDC integration** with the following security measures:

- **Session Management**: Server-side sessions stored in PostgreSQL
- **Role-Based Access**: Five-tier hierarchy with data isolation
- **Route Protection**: Middleware-based authentication checks
- **User Context**: React Query for client-side user state management

The system ensures data privacy by restricting access based on organizational hierarchy and user roles.

# External Dependencies

## Third-Party Services
- **SendGrid**: Email service for automated notifications and communication
- **Neon Database**: Serverless PostgreSQL hosting for production data storage
- **Replit Authentication**: OpenID Connect provider for user authentication

## Key Libraries
- **Frontend**: React, React Query, React Hook Form, Radix UI, Tailwind CSS, Zod, Wouter
- **Backend**: Express.js, Drizzle ORM, Passport.js, Express Session
- **Database**: PostgreSQL with Neon serverless driver
- **Development**: Vite, TypeScript, ESBuild for production builds

## API Integrations
- **Replit OIDC**: For secure user authentication and profile management
- **SendGrid API**: For sending review notifications, meeting invitations, and appeal communications
- **Neon Database API**: For serverless PostgreSQL connectivity and connection pooling