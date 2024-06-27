alter table postgres.public.prompts drop column if exists slug;
alter table postgres.public.prompt_category drop column if exists slug;

drop trigger if exists set_slug_from_name on public.prompt_category;
drop trigger if exists set_slug_from_name on public.prompts;

drop function if exists public.set_slug_from_name();

drop function if exists slugify(TEXT);
