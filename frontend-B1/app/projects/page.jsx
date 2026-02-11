'use client';

import { useEffect, useState } from 'react';
import api from '@/src/lib/api';
import RequireAuth from '@/components/RequireAuth';
import Link from 'next/link';

export default function ProjectsPage() {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/groups')
            .then(res => setGroups(res.data.groups))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <RequireAuth>
            <section className="panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1>📂 Collaborative Projects</h1>
                    <Link href="/projects/create">
                        <button className="btn-primary">+ New Project</button>
                    </Link>
                </div>

                {loading ? <p>Loading projects...</p> : (
                    <div className="grid-gallery">
                        {groups.length === 0 ? (
                            <p>You haven't joined any projects yet.</p>
                        ) : (
                            groups.map(group => (
                                <Link href={`/projects/${group.id}`} key={group.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div className="card">
                                        <div style={{ padding: '1rem' }}>
                                            <h3>{group.name}</h3>
                                            <p>{group.members?.length || 0} Members</p>
                                            <p>{group.albums?.length || 0} Albums</p>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                )}
            </section>
        </RequireAuth>
    );
}
