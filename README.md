# StreamApp - Netflix Clone

A premium streaming application built with Next.js, Tailwind CSS, and Supabase.

## Features
- 🎥 **Netflix-like Interface**: Glassmorphism, smooth animations, and responsive design.
- 📺 **Video Player**: Minimalist player (currently using sample video).
- 🛠 **Admin Dashboard**: Add movies/videos via `/admin` (protected by key).
- ☁ **Supabase & R2**: Designed for Supabase (DB) and R2 (Storage).

## Setup & Deployment

1.  **Environment Variables**:
    Set these in Vercel or `.env.local`:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
    ADMIN_KEY=mysecretpassword
    ```

2.  **Database Setup**:
    Run the SQL commands in `supabase_setup.sql` in your Supabase SQL Editor to create the `movies` table.

3.  **Storage**:
    Upload your videos to Cloudflare R2 or AWS S3. Get the public URL and paste it when adding a movie in the Admin panel.

4.  **Admin Access**:
    Go to `/admin` to add new movies. Enter the `ADMIN_KEY` you set in the environment variables.

## Local Development
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).
