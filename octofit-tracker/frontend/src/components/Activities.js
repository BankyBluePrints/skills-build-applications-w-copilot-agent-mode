import React, { useEffect, useState } from 'react';

const Activities = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const codespace = process.env.REACT_APP_CODESPACE_NAME;
    const endpoint = codespace
      ? `https://${codespace}-8000.app.github.dev/api/activities/`
      : '';
    console.log('Activities endpoint:', endpoint || 'missing REACT_APP_CODESPACE_NAME');

    const fetchData = async () => {
      if (!endpoint) {
        setError('Backend host not configured. Set REACT_APP_CODESPACE_NAME.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(endpoint, { signal: controller.signal });
        const payload = await response.json();
        console.log('Activities data:', payload);
        const normalized = Array.isArray(payload) ? payload : payload?.results ?? [];
        setItems(normalized);
        setError(null);
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('Activities fetch error:', err);
        setError('Failed to load activities.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, []);

  return (
    <div>
      <h2 className="mb-3">Activities</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="text-danger">{error}</p>}
      {!loading && !error && (
        <ul className="list-group">
          {items.map((item, idx) => (
            <li
              key={item.id ?? idx}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <span>{item.name ?? item.title ?? 'Activity'}</span>
              {item.duration && (
                <span className="badge bg-primary rounded-pill">{item.duration}</span>
              )}
            </li>
          ))}
          {items.length === 0 && <li className="list-group-item">No activities found.</li>}
        </ul>
      )}
    </div>
  );
};

export default Activities;
