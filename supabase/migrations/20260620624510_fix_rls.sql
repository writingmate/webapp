alter table public.prompt_category enable row level security;
alter table public.prompts_categories force row level security;
alter table public.assistant_platform_tools enable row level security;

-- only allow select on the tables
create policy "Allow select on prompt_category" on public.prompt_category for select using (true);
create policy "Allow select on prompts_categories" on public.prompts_categories for select using (true);
create policy "Allow select on assistant_platform_tools" on public.assistant_platform_tools for select using (true);
