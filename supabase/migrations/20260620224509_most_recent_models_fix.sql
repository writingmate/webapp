BEGIN;
create or replace view recent_models
    with (security_invoker=on)
as
select model,
       max(created_at) as last_used_at
from public.chats
group by model
order by last_used_at desc;
COMMIT;
