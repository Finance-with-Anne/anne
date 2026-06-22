DROP VIEW IF EXISTS public.blog_post_view_counts;

CREATE VIEW public.blog_post_view_counts
WITH (security_invoker = true)
AS
SELECT post_id,
    (count(*))::integer AS views
FROM blog_post_views
GROUP BY post_id;
