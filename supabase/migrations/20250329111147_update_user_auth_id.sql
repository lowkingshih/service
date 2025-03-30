-- Description: Updates the users table to use auth.uid() as the primary identifier
-- Affected tables: users
-- Special considerations: 
-- - Switches from email-based to auth.uid()-based identification
-- - Maintains email as a unique constraint for backward compatibility
-- - Updates all related policies to use auth.uid()

-- Drop existing policies
drop policy if exists "Users can view all users." on public.users;
drop policy if exists "Members can update their own profile." on public.users;
drop policy if exists "Admins have full access to users." on public.users;
drop policy if exists "Admins can insert users." on public.users;
drop policy if exists "Admins can update users." on public.users;
drop policy if exists "Admins can delete users." on public.users;

-- Update users table
alter table public.users
    -- Drop the existing id column
    drop column id cascade,
    -- Add new id column that matches auth.users.id
    add column id uuid primary key references auth.users(id),
    -- Make email nullable since some providers might not provide it
    alter column email drop not null;

-- Update handle_new_user function
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    insert into public.users (id, email)
    values (new.id, new.email)
    on conflict (id) do update
    set email = excluded.email;
    return new;
end;
$$;

-- Recreate policies using auth.uid()

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
    using (auth.uid() = id and role = 'member')
    with check (auth.uid() = id and role = 'member');

-- Allow admins full access
create policy "Admins have full access to users."
    on public.users
    for select
    to authenticated
    using (
        exists (
            select 1 from public.users
            where id = auth.uid()
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
            where id = auth.uid()
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
            where id = auth.uid()
            and role = 'admin'
        )
    )
    with check (
        exists (
            select 1 from public.users
            where id = auth.uid()
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
            where id = auth.uid()
            and role = 'admin'
        )
    );

-- Update posts table to use the new user id
alter table public.posts
    add constraint posts_user_id_fkey
        foreign key (user_id)
        references public.users(id)
        on delete cascade;

-- Update posts policies to use auth.uid()
drop policy if exists "Anyone can view posts." on public.posts;
drop policy if exists "Members can create their own posts." on public.posts;
drop policy if exists "Members can update their own posts." on public.posts;
drop policy if exists "Members can delete their own posts." on public.posts;
drop policy if exists "Admins have full access to select posts." on public.posts;
drop policy if exists "Admins have full access to insert posts." on public.posts;
drop policy if exists "Admins have full access to update posts." on public.posts;
drop policy if exists "Admins have full access to delete posts." on public.posts;

-- Recreate posts policies
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
            where id = auth.uid()
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
            where id = auth.uid()
            and role = 'member'
            and id = posts.user_id
        )
    )
    with check (
        exists (
            select 1 from public.users
            where id = auth.uid()
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
            where id = auth.uid()
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
            where id = auth.uid()
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
            where id = auth.uid()
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
            where id = auth.uid()
            and role = 'admin'
        )
    )
    with check (
        exists (
            select 1 from public.users
            where id = auth.uid()
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
            where id = auth.uid()
            and role = 'admin'
        )
    ); 