import React, { useEffect, useState } from 'react';

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const codespace = process.env.REACT_APP_CODESPACE_NAME;
    const endpoint = codespace ? `https://${codespace}-8000.app.github.dev/api/teams/` : '';
    console.log('Teams endpoint:', endpoint || 'missing REACT_APP_CODESPACE_NAME');

    const fetchData = async () => {
      if (!endpoint) {
        setError('Backend host not configured. Set REACT_APP_CODESPACE_NAME.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(endpoint, { signal: controller.signal });
        const payload = await response.json();
        console.log('Teams data:', payload);
        const normalized = Array.isArray(payload) ? payload : payload?.results ?? [];
        setTeams(normalized);
        setError(null);
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('Teams fetch error:', err);
        setError('Failed to load teams.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, []);

  return (
    <div>
      <h2 className="mb-3">Teams</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="text-danger">{error}</p>}
      {!loading && !error && (
        <ul className="list-group">
          {teams.map((team, idx) => (
            <li key={team.id ?? idx} className="list-group-item d-flex justify-content-between">
              <span>{team.name ?? 'Team'}</span>
              {(team.members_count ?? team.member_count) && (
                <span className="badge bg-secondary rounded-pill">
                  {team.members_count ?? team.member_count} members
                </span>
              )}
            </li>
          ))}
          {teams.length === 0 && <li className="list-group-item">No teams found.</li>}
        </ul>
      )}
    </div>
  );
};

export default Teams;
