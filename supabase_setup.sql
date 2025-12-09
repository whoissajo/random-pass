-- Create the movies table
create table movies (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  description text,
  thumbnail_url text,
  video_url text,
  genre text,
  duration text,
  year integer
);

-- Enable Row Level Security (RLS)
alter table movies enable row level security;

-- Create a policy that allows anyone to view movies
create policy "Public movies are viewable by everyone"
  on movies for select
  using ( true );

-- Create a policy that allows only service_role (Admin API) to insert
-- Note: The API uses the SERVICE_ROLE_KEY so it bypasses RLS, but this is good practice.
