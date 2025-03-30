-- Description: Creates the users table with role-based access control and related policies
-- Affected tables: users
-- Special considerations: 
-- - Email is used as the unique identifier for users across different auth providers
-- - Default role is 'member' with restricted write access
-- - Admin role has full access to all records

-- Create users table
create table public.users (
    id uuid default gen_random_uuid() primary key,
    email text not null unique,
    role text not null default 'member' check (role in ('member', 'admin')),
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

comment on table public.users is 'User profiles with role-based access control for the application.';

-- Enable row level security
alter table public.users enable row level security;

-- Create updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

-- Create trigger for updated_at
create trigger handle_users_updated_at
    before update on public.users
    for each row
    execute function public.handle_updated_at();

-- Create function to handle new user registration
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    insert into public.users (email)
    values (new.email)
    on conflict (email) do nothing;
    return new;
end;
$$;

-- Create trigger for new user registration
create trigger on_auth_user_created
    after insert on auth.users
    for each row
    execute function public.handle_new_user();

-- RLS Policies for users table

-- Allow all authenticated users to view all users
create policy "Users can view all users."
    on public.users
    for select
    to authenticated
    using (true);

-- Allow members to update their own profile
create policy "Members can update their own profile."
    on public.users
    for update
    to authenticated
    using (auth.jwt()->>'email' = email and role = 'member')
    with check (auth.jwt()->>'email' = email and role = 'member');

-- Allow admins full access
create policy "Admins have full access to users."
    on public.users
    for select
    to authenticated
    using (
        exists (
            select 1 from public.users
            where email = auth.jwt()->>'email'
            and role = 'admin'
        )
    );

create policy "Admins can insert users."
    on public.users
    for insert
    to authenticated
    with check (
        exists (
            select 1 from public.users
            where email = auth.jwt()->>'email'
            and role = 'admin'
        )
    );

create policy "Admins can update users."
    on public.users
    for update
    to authenticated
    using (
        exists (
            select 1 from public.users
            where email = auth.jwt()->>'email'
            and role = 'admin'
        )
    )
    with check (
        exists (
            select 1 from public.users
            where email = auth.jwt()->>'email'
            and role = 'admin'
        )
    );

create policy "Admins can delete users."
    on public.users
    for delete
    to authenticated
    using (
        exists (
            select 1 from public.users
            where email = auth.jwt()->>'email'
            and role = 'admin'
        )
    );

-- Example of a table that references users
create table public.posts (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    content text,
    user_id uuid references public.users(id) not null,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

comment on table public.posts is 'User created posts with role-based access control.';

-- Enable row level security
alter table public.posts enable row level security;

-- Create trigger for updated_at
create trigger handle_posts_updated_at
    before update on public.posts
    for each row
    execute function public.handle_updated_at();

-- RLS Policies for posts table

-- Allow all authenticated users to view all posts
create policy "Anyone can view posts."
    on public.posts
    for select
    to authenticated
    using (true);

-- Allow members to create their own posts
create policy "Members can create their own posts."
    on public.posts
    for insert
    to authenticated
    with check (
        exists (
            select 1 from public.users
            where email = auth.jwt()->>'email'
            and role = 'member'
            and id = posts.user_id
        )
    );

-- Allow members to update their own posts
create policy "Members can update their own posts."
    on public.posts
    for update
    to authenticated
    using (
        exists (
            select 1 from public.users
            where email = auth.jwt()->>'email'
            and role = 'member'
            and id = posts.user_id
        )
    )
    with check (
        exists (
            select 1 from public.users
            where email = auth.jwt()->>'email'
            and role = 'member'
            and id = posts.user_id
        )
    );

-- Allow members to delete their own posts
create policy "Members can delete their own posts."
    on public.posts
    for delete
    to authenticated
    using (
        exists (
            select 1 from public.users
            where email = auth.jwt()->>'email'
            and role = 'member'
            and id = posts.user_id
        )
    );

-- Allow admins full access to posts
create policy "Admins have full access to select posts."
    on public.posts
    for select
    to authenticated
    using (
        exists (
            select 1 from public.users
            where email = auth.jwt()->>'email'
            and role = 'admin'
        )
    );

create policy "Admins have full access to insert posts."
    on public.posts
    for insert
    to authenticated
    with check (
        exists (
            select 1 from public.users
            where email = auth.jwt()->>'email'
            and role = 'admin'
        )
    );

create policy "Admins have full access to update posts."
    on public.posts
    for update
    to authenticated
    using (
        exists (
            select 1 from public.users
            where email = auth.jwt()->>'email'
            and role = 'admin'
        )
    )
    with check (
        exists (
            select 1 from public.users
            where email = auth.jwt()->>'email'
            and role = 'admin'
        )
    );

create policy "Admins have full access to delete posts."
    on public.posts
    for delete
    to authenticated
    using (
        exists (
            select 1 from public.users
            where email = auth.jwt()->>'email'
            and role = 'admin'
        )
    ); 