import React, { useCallback, useEffect, useMemo, useState } from 'react';

const Activities = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');

  const endpoint = useMemo(() => {
    const codespace = process.env.REACT_APP_CODESPACE_NAME;
    return codespace ? `https://${codespace}-8000.app.github.dev/api/activities/` : '';
  }, []);

  const fetchData = useCallback(() => {
    const controller = new AbortController();
    setLoading(true);

    if (!endpoint) {
      setError('Backend host not configured. Set REACT_APP_CODESPACE_NAME.');
      setLoading(false);
      return controller;
    }

    (async () => {
      try {
        const response = await fetch(endpoint, { signal: controller.signal });
        const payload = await response.json();
        const normalized = Array.isArray(payload) ? payload : payload?.results ?? [];
        setItems(normalized);
        setError(null);
      } catch (err) {
        if (err.name === 'AbortError') return;
        setError('Failed to load activities.');
      } finally {
        setLoading(false);
      }
    })();

    return controller;
  }, [endpoint]);

  useEffect(() => {
    const controller = fetchData();
    return () => controller.abort();
  }, [fetchData]);

  const filteredItems = useMemo(() => {
    const term = filter.trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) =>
      (item.name ?? item.title ?? '').toString().toLowerCase().includes(term)
    );
  }, [items, filter]);

  return (
    <section className="card card-surface mb-4">
      <div className="card-header d-flex flex-wrap align-items-center justify-content-between gap-3">
        <div>
          <h2 className="h5 card-title mb-0">Activities</h2>
          <small className="muted-label">Latest logged training sessions</small>
        </div>
        <div className="d-flex flex-wrap align-items-center gap-2">
          <div className="input-group input-group-sm">
            <span className="input-group-text">Filter</span>
            <input
              type="search"
              className="form-control"
              placeholder="Search activities"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="btn btn-primary btn-sm btn-glow"
            onClick={fetchData}
            disabled={loading}
          >
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="card-body">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {loading && (
          <div className="d-flex align-items-center gap-2 text-light">
            <div className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
            <span>Loading activities…</span>
          </div>
        )}

        {!loading && !error && (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col">Activity</th>
                  <th scope="col">Duration</th>
                  <th scope="col">Category</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan="3" className="table-empty-state py-4">
                      No activities found.
                    </td>
                  </tr>
                )}

                {filteredItems.map((item, idx) => (
                  <tr key={item.id ?? idx}>
                    <td className="fw-semibold">{item.name ?? item.title ?? 'Activity'}</td>
                    <td>
                      {item.duration ? (
                        <span className="badge bg-info text-dark">{item.duration}</span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td>
                      <span className="status-pill">
                        {item.type ?? item.category ?? 'General'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default Activities;
