-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- Profiles Table (Public info for users)
create table public.profiles (
  id uuid references auth.users(id) primary key,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Contacts Table
create table public.contacts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) not null,
  name text not null,
  company text,
  email text,
  phone text,
  position text,
  google_contact_id text,
  source_platform text not null check (source_platform in ('google', 'linkedin', 'whatsapp', 'instagram', 'manual')),
  source_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes
create index contacts_user_id_idx on public.contacts(user_id);
create index contacts_name_trgm_idx on public.contacts using gin (name gin_trgm_ops);
create index contacts_company_trgm_idx on public.contacts using gin (company gin_trgm_ops);
create index contacts_source_platform_idx on public.contacts(source_platform);
create index contacts_email_idx on public.contacts(email);

-- RLS for Contacts
alter table public.contacts enable row level security;

create policy "Users can view their own contacts"
  on public.contacts for select
  using (auth.uid() = user_id);

create policy "Users can insert their own contacts"
  on public.contacts for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own contacts"
  on public.contacts for update
  using (auth.uid() = user_id);

create policy "Users can delete their own contacts"
  on public.contacts for delete
  using (auth.uid() = user_id);

-- Platform Connections Table
create table public.user_platform_connections (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) not null,
  platform text not null,
  access_token text, -- Encrypted at application layer
  refresh_token text, -- Encrypted at application layer
  token_expires_at timestamp with time zone,
  connected_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_synced_at timestamp with time zone,
  is_active boolean default true,
  unique(user_id, platform)
);

-- RLS for Platform Connections
alter table public.user_platform_connections enable row level security;

create policy "Users can view their own connections"
  on public.user_platform_connections for select
  using (auth.uid() = user_id);

create policy "Users can insert their own connections"
  on public.user_platform_connections for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own connections"
  on public.user_platform_connections for update
  using (auth.uid() = user_id);

create policy "Users can delete their own connections"
  on public.user_platform_connections for delete
  using (auth.uid() = user_id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user
-- create trigger on_auth_user_created
--   after insert on auth.users
--   for each row execute procedure public.handle_new_user();

-- Secure Search Function
create or replace function search_contacts_secure(query_text text)
returns table (
  name text,
  company text,
  position text
) 
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select distinct c.name, c.company, c.position
  from contacts c
  where 
    (c.name ilike '%' || query_text || '%' or c.company ilike '%' || query_text || '%')
    -- Exclude own contacts from search results (optional, depending on UX)
    and c.user_id != auth.uid()
  limit 50;
end;
$$;

-- Mutual Connections Function
create or replace function get_mutual_connections_summary()
returns table (
  user_id uuid,
  user_name text,
  user_avatar text,
  mutual_count bigint
)
language plpgsql
security definer
set search_path = public
as $$
declare
  my_id uuid := auth.uid();
begin
  return query
  with my_emails as (
    select email from contacts where contacts.user_id = my_id and email is not null
  ),
  other_users_matches as (
    select c.user_id, count(*) as match_count
    from contacts c
    join my_emails me on c.email = me.email
    where c.user_id != my_id
    group by c.user_id
  )
  select 
    oum.user_id,
    p.full_name as user_name,
    p.avatar_url as user_avatar,
    oum.match_count as mutual_count
  from other_users_matches oum
  join profiles p on p.id = oum.user_id
  order by match_count desc;
end;
$$;


