import React, { useEffect, useState } from 'react';

const Leaderboard = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const codespace = process.env.REACT_APP_CODESPACE_NAME;
    const endpoint = codespace
      ? `https://${codespace}-8000.app.github.dev/api/leaderboard/`
      : '';
    console.log('Leaderboard endpoint:', endpoint || 'missing REACT_APP_CODESPACE_NAME');

    const fetchData = async () => {
      if (!endpoint) {
        setError('Backend host not configured. Set REACT_APP_CODESPACE_NAME.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(endpoint, { signal: controller.signal });
        const payload = await response.json();
        console.log('Leaderboard data:', payload);
        const normalized = Array.isArray(payload) ? payload : payload?.results ?? [];
        setEntries(normalized);
        setError(null);
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('Leaderboard fetch error:', err);
        setError('Failed to load leaderboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, []);

  return (
    <div>
      <h2 className="mb-3">Leaderboard</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="text-danger">{error}</p>}
      {!loading && !error && (
        <ol className="list-group list-group-numbered">
          {entries.map((entry, idx) => (
            <li key={entry.id ?? idx} className="list-group-item d-flex justify-content-between">
              <span>{entry.user ?? entry.name ?? 'Participant'}</span>
              <span className="fw-bold">{entry.score ?? entry.points ?? '—'}</span>
            </li>
          ))}
          {entries.length === 0 && <li className="list-group-item">No leaderboard entries.</li>}
        </ol>
      )}
    </div>
  );
};

export default Leaderboard;
