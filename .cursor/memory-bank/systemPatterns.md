# System Patterns

## Overall Architecture
- **Strategy:** Frontend-First Development. The immediate focus is on building a high-quality user experience and implementing the core drawing features within the Next.js application.
- **Frontend:** A modern, component-based architecture using Next.js and React. `shadcn/ui` provides a consistent and reusable set of UI primitives.
- **Backend: TBD.** The backend architecture is not yet defined. It will be designed later to support the frontend's requirements for user data, drawings, and social interactions.

## Key Decisions & Patterns
- **Ignoring the Legacy Backend:** All development will proceed without depending on the old backend codebase. This is a critical constraint to avoid building on a deprecated system.
- **Component-Driven UI:** Leveraging `shadcn/ui` means we build interfaces by composing small, single-purpose components, which improves maintainability and development speed.
- **Vercel for Deployment:** The frontend will be built and deployed using Vercel's infrastructure, which is optimized for Next.js applications. 