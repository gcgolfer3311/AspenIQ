# AspenIQ Backend - Setup Steps

This is the real backend foundation: database schema, login, and the first
working API endpoint (reminders). It does NOT yet include the rest of the
app's data (placements, invoices, documents, facilities, etc.) - those follow
the exact same pattern as reminders.js once this foundation is confirmed
working.

## What this gives you today
- A real Postgres database (not local storage)
- A login screen - only someone with the password gets in
- One real, working API endpoint (reminders) as the proven pattern

## What still needs to happen after this
- The other ~85 functions in AspenIQ.html need to be converted from
  localStorage calls to API calls, following reminders.js as the template
- The frontend needs a login screen wired to /api/login
- Once that's done, this becomes the single working backend for everything

## Setup steps

1. Create a new GitHub repository (public or private, either is fine)
2. Upload every file in this folder to that repository (GitHub's website
   lets you drag files directly onto the "Add file > Upload files" screen -
   no command line needed)
3. In Netlify, go to your existing site (chipper-kitsune-7c8454)
   -> Site configuration -> Build & deploy -> Link repository
   -> connect it to the GitHub repo you just created
4. In Netlify, go to Site configuration -> Environment variables and add:
   - APP_PASSWORD - whatever password you want to log in with
   - SESSION_SECRET - any long random string (this signs your login session)
5. Trigger a deploy. Netlify will automatically:
   - Install @netlify/database
   - Provision the real Postgres database
   - Run the migration (creates every table)
   - Deploy the login and reminders API

Once this deploys successfully, tell me and I'll build the login screen
and convert the rest of the app's data over, one section at a time.
