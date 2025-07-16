# Progress

## What Works
- **User Authentication:** A complete, two-tab magic link authentication flow is implemented using Supabase. It is confirmed to work on all major browsers, including Safari.
- A basic Next.js 15 project is set up, with dependencies installed.
- The new homepage is implemented at `hotdot-landing.tsx`, matching the Figma design.
- The `memory-bank` is established, populated, and includes a `designSystem.md` file for project tokens.
- A working Figma MCP integration is configured for fetching design data.
- The `Space Grotesk` font is correctly configured and loaded via `next/font`.

## What's Left to Build
- **Everything related to the core product:**
  - The "Daily Challenge" drawing mode.
  - The main drawing canvas/interface.
  - User profiles (post-authentication).
  - Personal galleries for drawings.
  - The system for challenging friends.
- **A brand new backend:** A complete backend needs to be designed, built, and deployed to support the application's features.

## Current Status
The project is in the **initial design and development phase** of a major pivot. Core foundational features like the homepage and authentication are now in place. The next focus is building the main product features.

## Known Issues
- The legacy backend code in the `/canvas` directory is a major piece of technical debt that should be ignored and eventually removed.
- The current UI flow (`/create`, `/guess`) is a remnant of the old concept and needs to be replaced.
- Several dependencies (`react-day-picker`, `vaul`) are not fully compatible with React 19 and required the `--legacy-peer-deps` flag to install. This should be addressed in the future.
