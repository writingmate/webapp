begin;
alter table public.messages
    add column if not exists word_count integer default 0;
CREATE OR REPLACE FUNCTION calculate_word_count()
    RETURNS TRIGGER AS
$$
BEGIN
    NEW.word_count := array_length(regexp_split_to_array(NEW.content, E'\\s+'), 1);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

drop trigger if exists set_message_word_count on public.messages;
CREATE TRIGGER set_message_word_count
    BEFORE INSERT OR UPDATE
    ON public.messages
    FOR EACH ROW
EXECUTE FUNCTION calculate_word_count();
commit;
