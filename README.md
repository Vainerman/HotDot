# HotDot - A Social Drawing Game

[![Deployed on Vercel](https://vercel.com/button)](https://hotdot.vercel.app/)

HotDot is a creative and social drawing game where users can turn simple templates into unique doodles and challenge friends to do the same. It's a fun, simple, and collaborative platform that encourages artistic expression and lighthearted competition.

## Features

- **Creative Drawing Canvas:** Start with a basic shape or "hot dot" and let your imagination run wild.
- **Solo Play Mode:** Create and save drawings to your personal gallery.
- **Challenge Friends:** Share your creations and challenge friends to replicate or interpret your doodle.
- **User Authentication:** Secure sign-in using one-time passcodes sent to your email.
- **Responsive Design:** A seamless experience on both desktop and mobile devices.

## Tech Stack

**Frontend:**
- **Framework:** [Next.js](https://nextjs.org/) 15
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **UI:** [React](https://reactjs.org/) 19 & [Tailwind CSS](https://tailwindcss.com/)
- **Component Library:** [shadcn/ui](https://ui.shadcn.com/)
- **State Management:** React Hooks & Context API
- **Deployment:** [Vercel](https://vercel.com/)

**Backend:**
- **Provider:** [Supabase](https://supabase.io/)
- **Authentication:** Supabase Auth (OTP Email Login)
- **Database:** Supabase Postgres
- **Storage:** Supabase Storage for user drawings

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js (v18 or later)
- pnpm

### Installation

1.  **Clone the repo**
    ```sh
    git clone https://github.com/your_username_/HotDot.git
    ```
2.  **Install NPM packages**
    ```sh
    pnpm install
    ```
3.  **Set up environment variables**

    Create a `.env.local` file in the root of the project and add your Supabase project URL and anon key.

    ```
    NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    ```

4.  **Run the development server**
    ```sh
    pnpm dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## License

Distributed under the MIT License. See `LICENSE` for more information.
