# Challenge Flow Implementation Plan

This document outlines the steps required to allow a player to share a drawing as a challenge and let other users play it.

## Database Changes
Add a new table `challenges` in Supabase with the following columns:

- `id` (uuid, primary key, default `uuid_generate_v4()`)
- `user_id` (uuid, references `auth.users`)
- `template_svg` (text) – SVG markup of the template
- `template_viewbox` (text) – original viewBox value
- `created_at` (timestamp with time zone, default `now()`)

This table stores the template used when a challenge is created so that other players can draw on the exact same outline.

## Application Flow
1. **Solo Play**
   - When the page loads it fetches a random template from `/api/templates`.
   - The fetched SVG and viewBox are stored in component state so they can be reused later.
   - After completing a drawing the user hits **KEEP**. The drawing is saved using the existing `saveDrawing` action.
   - When **CHALLENGE IT** is pressed the new `createChallenge` server action is called with the stored template data. A record is inserted into `challenges` and the user is redirected to `/challenge/[id]/share`.
2. **Share Page** (`/challenge/[id]/share`)
   - Displays a link (`/challenge/[id]`) that can be shared with friends and a **PLAY AGAIN** button that goes back to `/solo-play`.
3. **Challenge Page** (`/challenge/[id]`)
   - On mount it fetches the challenge data from `/api/challenge/[id]`.
   - The canvas is then initialized with the stored template so the guest draws with the same outline.
   - The page UI mirrors `solo-play` with a timer, clear/done controls and the ability to replay the challenge with the same template.

With this flow a player can create a drawing, share a link and allow anyone with the link to attempt the same template.

## Automated Data Cleanup

To prevent indefinite storage of match and challenge data, an automated cleanup process has been implemented.

- **Cleanup Logic**: A SQL function `cleanup_old_matches_and_challenges` is created in the database. This function first marks any active matches older than one hour as `completed`. Then, it deletes records from the `matches` and `challenges` tables based on the following criteria:
    - Matches with a status of `completed` or `failed`.
    - Associated challenges are deleted along with the matches to prevent orphaned data.
    - Challenges older than 24 hours that were never associated with a match are also removed.

- **Scheduling**: The cleanup function is scheduled to run daily using the `pg_cron` extension in Supabase. This ensures that old data is periodically and automatically purged from the database.
