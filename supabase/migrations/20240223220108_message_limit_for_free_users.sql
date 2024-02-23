CREATE policy "Pro subscription required for unlimited messages"
    on messages FOR INSERT TO authenticated WITH CHECK
    ((select count(1)
      from messages
      where user_id = auth.uid()::uuid
        and created_at > (now() - interval '1 day')) < 30
        or (user_id in (SELECT user_id
                        FROM profiles
                        WHERE user_id = auth.uid()::uuid
                          and plan like 'pro_%')))
