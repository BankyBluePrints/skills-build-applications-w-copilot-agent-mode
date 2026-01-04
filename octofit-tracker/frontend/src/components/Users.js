import React, { useEffect, useState } from 'react';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const codespace = process.env.REACT_APP_CODESPACE_NAME;
    const endpoint = codespace ? `https://${codespace}-8000.app.github.dev/api/users/` : '';
    console.log('Users endpoint:', endpoint || 'missing REACT_APP_CODESPACE_NAME');

    const fetchData = async () => {
      if (!endpoint) {
        setError('Backend host not configured. Set REACT_APP_CODESPACE_NAME.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(endpoint, { signal: controller.signal });
        const payload = await response.json();
        console.log('Users data:', payload);
        const normalized = Array.isArray(payload) ? payload : payload?.results ?? [];
        setUsers(normalized);
        setError(null);
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('Users fetch error:', err);
        setError('Failed to load users.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, []);

  return (
    <div>
      <h2 className="mb-3">Users</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="text-danger">{error}</p>}
      {!loading && !error && (
        <ul className="list-group">
          {users.map((user, idx) => (
            <li key={user.id ?? idx} className="list-group-item d-flex justify-content-between">
              <span>{user.username ?? user.name ?? 'User'}</span>
              {user.email && <span className="text-muted">{user.email}</span>}
            </li>
          ))}
          {users.length === 0 && <li className="list-group-item">No users found.</li>}
        </ul>
      )}
    </div>
  );
};

export default Users;
