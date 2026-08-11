// Mock pg-style pool for testing auth.js in isolation.
// Real project uses `pg`'s Pool; this fake implements just enough of
// `.query(sql, params)` to drive the two queries auth.js issues.

let users = [];
let nextId = 1;

function reset() {
  users = [];
  nextId = 1;
}

async function query(sql, params = []) {
  const normalized = sql.trim().toLowerCase();

  if (normalized.startsWith('select id from users where email')) {
    const [email] = params;
    const rows = users.filter(u => u.email === email).map(u => ({ id: u.id }));
    return { rows };
  }

  if (normalized.startsWith('insert into users')) {
    const [name, email, password_hash, role] = params;
    const user = { id: String(nextId++), name, email, password_hash, role };
    users.push(user);
    return { rows: [{ id: user.id, name: user.name, email: user.email, role: user.role }] };
  }

  if (normalized.startsWith('select id, name, email, password_hash, role from users where email')) {
    const [email] = params;
    const user = users.find(u => u.email === email);
    return { rows: user ? [user] : [] };
  }

  if (normalized.startsWith('select id, name, email, role from users where id')) {
    const [id] = params;
    const user = users.find(u => u.id === id);
    const rows = user ? [{ id: user.id, name: user.name, email: user.email, role: user.role }] : [];
    return { rows };
  }

  throw new Error(`Mock db received unexpected query: ${sql}`);
}

module.exports = { query, __reset: reset, __users: () => users };