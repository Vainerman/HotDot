# Supabase Auth Configuration

To enable one-time password (OTP) login, configure your Supabase project with the following settings:

1. **Enable email OTP** under **Auth > Settings**.
2. Update the sign-in email template to include `{{ .Token }}` in the body so users receive the six-digit code.

The application expects a 6-digit passcode and does not use magic links anymore.
