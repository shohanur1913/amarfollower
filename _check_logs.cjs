import { Client } from 'pg';
const c = new Client('postgresql://postgres:postgres@localhost:5432/amarfollower');
c.connect();
c.query("SELECT to_email, subject, status, created_at FROM email_log ORDER BY created_at DESC LIMIT 5", [], (err, r) => {
  if (err) { console.error(err); c.end(); return; }
  console.log(JSON.stringify(r.rows, null, 2));
  c.end();
});
