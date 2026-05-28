-- Ensure cms-media bucket allows WebP, JPEG, and PNG (idempotent).
-- Merges into existing allowed_mime_types so legacy GIF/SVG objects stay valid.

update storage.buckets b
set allowed_mime_types = (
  select coalesce(array_agg(distinct t order by t), '{}'::text[])
  from (
    select unnest(coalesce(b.allowed_mime_types, '{}'::text[])) as t
    union all
    select unnest(
      array['image/webp', 'image/jpeg', 'image/png']::text[]
    ) as t
  ) merged
)
where b.id = 'cms-media';
