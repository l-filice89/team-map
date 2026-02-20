-- Create users table
create table if not exists public.users (
  id uuid primary key references auth.users on delete cascade,
  email text unique not null,
  full_name text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.users enable row level security;

-- RLS policies: users can read their own profile
create policy "Users can view their own profile"
  on public.users
  for select
  using (auth.uid() = id);

-- RLS policy: users can update their own profile
create policy "Users can update their own profile"
  on public.users
  for update
  using (auth.uid() = id);

-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Trigger to auto-create user profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();