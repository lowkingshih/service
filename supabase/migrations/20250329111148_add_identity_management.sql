-- Description: Adds identity management support
-- Affected tables: users
-- Special considerations: 
-- - Adds email_verified flag
-- - Adds identity management functions
-- - Updates policies to handle unverified emails

-- Add email_verified column to users table
alter table public.users
    add column email_verified boolean default false;

-- Create function to sync email verification status
create or replace function public.sync_email_verification()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    update public.users
    set email_verified = exists (
        select 1
        from auth.users
        where id = new.id
        and email_confirmed_at is not null
    )
    where id = new.id;
    return new;
end;
$$;

-- Create trigger for email verification sync
create trigger on_auth_email_verification
    after update of email_confirmed_at on auth.users
    for each row
    execute function public.sync_email_verification();

-- Update handle_new_user function to include email verification
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    insert into public.users (id, email, email_verified)
    values (
        new.id,
        new.email,
        new.email_confirmed_at is not null
    )
    on conflict (id) do update
    set 
        email = excluded.email,
        email_verified = excluded.email_verified;
    return new;
end;
$$;

-- Drop existing policies
drop policy if exists "Members can update their own profile." on public.users;
drop policy if exists "Admins can update users." on public.users;

-- Create new policies with email verification check
create policy "Members can update their own profile."
    on public.users
    for update
    to authenticated
    using (
        auth.uid() = id 
        and role = 'member'
        and email_verified = true
    )
    with check (
        auth.uid() = id 
        and role = 'member'
        and email_verified = true
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
            and email_verified = true
        )
    )
    with check (
        exists (
            select 1 from public.users
            where id = auth.uid()
            and role = 'admin'
            and email_verified = true
        )
    );

comment on table public.users is 'User profiles with role-based access control and identity management support.'; 