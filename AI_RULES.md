# AI Editor Rules and Technical Guidelines

This document outlines the technical stack and mandatory coding conventions for maintaining and extending the CourseHub application.

## 1. Tech Stack Overview

The application is built using a modern, streamlined stack:

*   **Frontend Framework:** React (v18) with TypeScript.
*   **Routing:** React Router v6 for client-side navigation.
*   **Backend & Database:** Supabase (PostgreSQL, Authentication, and Real-Time features).
*   **Styling:** Tailwind CSS for utility-first, responsive design.
*   **UI Library:** shadcn/ui (pre-installed and preferred for standard components).
*   **Icons:** `lucide-react`.
*   **Data Access:** All database interactions must use the `@supabase/supabase-js` client (`src/lib/supabase.ts`).
*   **Build Tool:** Vite.

## 2. Mandatory Coding Guidelines

### A. File Structure and Organization

1.  **Source Directory:** All source code must reside in the `src/` directory.
2.  **Pages:** Application routes/views must be placed in `src/pages/`.
3.  **Components:** Reusable UI elements must be placed in `src/components/`.
4.  **Component Size:** Components should be small and focused (ideally under 100 lines). New components must always be created in their own file.

### B. Library Usage Rules

| Feature | Mandatory Library/Tool | Notes |
| :--- | :--- | :--- |
| **UI Components** | shadcn/ui & Tailwind CSS | Prioritize shadcn/ui. Use raw Tailwind utilities for custom styling. |
| **Icons** | `lucide-react` | Must be used for all visual icons. |
| **Data/Auth** | `@supabase/supabase-js` | Use the client exported from `src/lib/supabase.ts`. |
| **Routing** | `react-router-dom` | Use `BrowserRouter`, `Routes`, and `Route` as defined in `src/App.tsx`. |
| **Responsiveness** | Tailwind CSS | All designs must be fully responsive. |

### C. Data Handling

*   **Types:** Always use TypeScript interfaces and types, leveraging `src/lib/database.types.ts` for Supabase schema definitions.
*   **Error Handling:** Do not use `try/catch` blocks unless specifically requested or required for user feedback (e.g., in forms). Errors should generally be allowed to bubble up.