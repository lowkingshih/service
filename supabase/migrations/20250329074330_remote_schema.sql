create table "public"."comments" (
    "id" uuid not null default uuid_generate_v4(),
    "post_slug" text not null,
    "content" text not null,
    "author_id" uuid,
    "author_name" text,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now())
);


alter table "public"."comments" enable row level security;

create table "public"."instruments" (
    "id" bigint generated always as identity not null,
    "name" text not null
);


alter table "public"."instruments" enable row level security;

CREATE UNIQUE INDEX comments_pkey ON public.comments USING btree (id);

CREATE UNIQUE INDEX instruments_pkey ON public.instruments USING btree (id);

alter table "public"."comments" add constraint "comments_pkey" PRIMARY KEY using index "comments_pkey";

alter table "public"."instruments" add constraint "instruments_pkey" PRIMARY KEY using index "instruments_pkey";

alter table "public"."comments" add constraint "comments_author_id_fkey" FOREIGN KEY (author_id) REFERENCES auth.users(id) not valid;

alter table "public"."comments" validate constraint "comments_author_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$
;

grant delete on table "public"."comments" to "anon";

grant insert on table "public"."comments" to "anon";

grant references on table "public"."comments" to "anon";

grant select on table "public"."comments" to "anon";

grant trigger on table "public"."comments" to "anon";

grant truncate on table "public"."comments" to "anon";

grant update on table "public"."comments" to "anon";

grant delete on table "public"."comments" to "authenticated";

grant insert on table "public"."comments" to "authenticated";

grant references on table "public"."comments" to "authenticated";

grant select on table "public"."comments" to "authenticated";

grant trigger on table "public"."comments" to "authenticated";

grant truncate on table "public"."comments" to "authenticated";

grant update on table "public"."comments" to "authenticated";

grant delete on table "public"."comments" to "service_role";

grant insert on table "public"."comments" to "service_role";

grant references on table "public"."comments" to "service_role";

grant select on table "public"."comments" to "service_role";

grant trigger on table "public"."comments" to "service_role";

grant truncate on table "public"."comments" to "service_role";

grant update on table "public"."comments" to "service_role";

grant delete on table "public"."instruments" to "anon";

grant insert on table "public"."instruments" to "anon";

grant references on table "public"."instruments" to "anon";

grant select on table "public"."instruments" to "anon";

grant trigger on table "public"."instruments" to "anon";

grant truncate on table "public"."instruments" to "anon";

grant update on table "public"."instruments" to "anon";

grant delete on table "public"."instruments" to "authenticated";

grant insert on table "public"."instruments" to "authenticated";

grant references on table "public"."instruments" to "authenticated";

grant select on table "public"."instruments" to "authenticated";

grant trigger on table "public"."instruments" to "authenticated";

grant truncate on table "public"."instruments" to "authenticated";

grant update on table "public"."instruments" to "authenticated";

grant delete on table "public"."instruments" to "service_role";

grant insert on table "public"."instruments" to "service_role";

grant references on table "public"."instruments" to "service_role";

grant select on table "public"."instruments" to "service_role";

grant trigger on table "public"."instruments" to "service_role";

grant truncate on table "public"."instruments" to "service_role";

grant update on table "public"."instruments" to "service_role";

create policy "Users can update own comments"
on "public"."comments"
as permissive
for update
to public
using ((auth.uid() = author_id));


create policy "public can read instruments"
on "public"."instruments"
as permissive
for select
to anon
using (true);


CREATE TRIGGER comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION handle_updated_at();


