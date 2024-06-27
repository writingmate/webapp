begin;
insert into auth.users (id, email, role, created_at, updated_at) values ('00000000-0000-0000-0000-000000000000', 'admin@writingmate.ai', 'admin', now(), now());
commit;
