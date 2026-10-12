-- The private token is provisioned separately in Edge secrets and Vault, never in Git.
create extension if not exists pg_net with schema extensions;
revoke all on schema net from public, anon, authenticated;
revoke all on all tables in schema net from public, anon, authenticated;
revoke all on all functions in schema net from public, anon, authenticated;
revoke all on vault.decrypted_secrets from public, anon, authenticated;
select cron.schedule('launch-operations-hourly', '5 * * * *', $job$
  select net.http_post(
    url := 'https://pubhgajlqhdbpwqahtki.supabase.co/functions/v1/launch-ops',
    headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || token.decrypted_secret),
    body := '{"kind":"scheduled"}'::jsonb,
    timeout_milliseconds := 120000
  )
  from vault.decrypted_secrets as token where token.name = 'launch_ops_token';
$job$);
