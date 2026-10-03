# Jeswin Eldos Portfolio — Fresh CMS

This version removes Google Sheets and Tiiny from the architecture.

## Stack
- Cloudflare Pages: free website hosting
- Cloudflare Pages Functions: API + admin backend
- Cloudflare D1: project database
- Google Drive: media storage for large images/videos

## Admin
Open `/admin.html` on the deployed site.

Admin supports:
- Add work
- Edit work
- Delete work from portfolio metadata
- Draft / Published
- Featured
- Type (Graphic / Video)
- Category
- Client
- Description
- Tags
- Project date
- Sort order
- Custom thumbnail URL

Deleting a project removes it from the CMS database only. It does NOT delete the original Google Drive file.

## Cloudflare setup
1. Create a Cloudflare Pages project from this folder/repository.
2. Create a D1 database.
3. In Pages: Settings > Bindings > Add > D1 database binding. Use variable name `DB`, select the database, then redeploy.
4. Run `schema.sql` in the D1 SQL console.
5. Add two Pages environment variables/secrets:
   - `ADMIN_PASSWORD` = your private admin password
   - `ADMIN_SECRET` = a long random secret string
6. Redeploy.
7. Open `/admin.html` and sign in.

The public website reads `/api/projects` and therefore shows only published records in D1.

## Media
For Google Drive media, paste the Drive file link into the admin form. The backend extracts the Drive file ID and automatically creates a Drive thumbnail. Make sure the Drive file is shared so viewers can access it.

For direct media hosting, paste the direct image/video URL and optionally provide a custom thumbnail URL.
