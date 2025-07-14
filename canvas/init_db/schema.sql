create schema if not exists next_auth;

-- users table
create table next_auth.users (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  "emailVerified" timestamptz,
  image text
);

-- accounts table
create table next_auth.accounts (
  id uuid primary key default gen_random_uuid(),
  "userId" uuid references next_auth.users(id) on delete cascade,
  type text,
  provider text,
  "providerAccountId" text,
  refresh_token text,
  access_token text,
  expires_at int,
  token_type text,
  scope text,
  id_token text,
  session_state text
);

-- sessions table
create table next_auth.sessions (
  id uuid primary key default gen_random_uuid(),
  "sessionToken" text,
  "userId" uuid references next_auth.users(id) on delete cascade
);

-- verification_tokens table
create table next_auth.verification_tokens (
  identifier text,
  token text,
  expires timestamptz
);
