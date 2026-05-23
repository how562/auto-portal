-- Align smart_match_rules with app query column `lifestyle` (some DBs have lifestyle_key from an older draft).
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'smart_match_rules'
      and column_name = 'lifestyle_key'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'smart_match_rules'
      and column_name = 'lifestyle'
  ) then
    alter table public.smart_match_rules
      rename column lifestyle_key to lifestyle;
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'smart_match_rules'
      and column_name = 'lifestyle'
  ) then
    alter table public.smart_match_rules
      add column lifestyle text;

    update public.smart_match_rules
    set lifestyle = coalesce(lifestyle, 'family')
    where lifestyle is null;

    alter table public.smart_match_rules
      alter column lifestyle set not null;
  end if;
end $$;

drop index if exists public.smart_match_rules_lifestyle_priority_idx;
create index if not exists smart_match_rules_lifestyle_priority_idx
  on public.smart_match_rules (lifestyle, priority)
  where is_active = true;
