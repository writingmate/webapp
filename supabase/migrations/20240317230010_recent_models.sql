BEGIN;
create or replace view recent_models as
select model,
       user_id,
       max(created_at) as last_used_at
from public.chats
group by model, user_id
order by last_used_at desc;

CREATE POLICY "Allow full access to recent models"
    ON recent_models
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
COMMIT;
