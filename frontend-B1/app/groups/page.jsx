'use client';

import { useEffect, useState } from 'react';
import RequireAuth from '@/components/RequireAuth';
import api from '@/src/lib/api';

export default function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [name, setName] = useState('');

  const loadGroups = async () => {
    const res = await api.get('/groups');
    setGroups(res.data.groups || []);
  };

  useEffect(() => {
    loadGroups().catch(() => setGroups([]));
  }, []);

  const createGroup = async (event) => {
    event.preventDefault();
    await api.post('/groups', { name, members: [] });
    setName('');
    await loadGroups();
  };

  return (
    <RequireAuth>
      <section className="grid-two">
        <article className="panel">
          <h1>Groups</h1>
          <form className="stack-form" onSubmit={createGroup}>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Group name" required />
            <button type="submit">Create group</button>
          </form>
        </article>

        <article className="panel">
          <h2>Your Groups</h2>
          <ul className="list">
            {groups.map((group) => (
              <li key={group._id}>
                <strong>{group.name}</strong>
                <span>{group.members?.length || 0} members</span>
                <span>{group.albums?.length || 0} albums</span>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </RequireAuth>
  );
}
