alter table public.contacts add constraint contacts_user_platform_source_unique unique (user_id, source_platform, source_id);

