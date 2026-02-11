'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/src/lib/api';
import RequireAuth from '@/components/RequireAuth';

export default function ChallengeDetailsPage() {
    const { id } = useParams();
    const [challenge, setChallenge] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        api.get(`/challenges/${id}`)
            .then(res => setChallenge(res.data.challenge))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [id]);

    const vote = async (entryId) => {
        try {
            await api.post(`/challenges/${id}/entries/${entryId}/vote`);
            // Optimistically update or refetch
            setChallenge(prev => ({
                ...prev,
                Entries: prev.Entries.map(e => e.id === entryId ? { ...e, votesCount: e.votesCount + 1 } : e)
            }));
        } catch (err) {
            alert('Failed to vote');
        }
    };

    if (loading) return <p>Loading...</p>;
    if (!challenge) return <p>Challenge not found</p>;

    return (
        <RequireAuth>
            <section className="panel">
                <h1>{challenge.title}</h1>
                <p>{challenge.description}</p>

                <h2>Entries</h2>
                <div className="gallery-grid">
                    {challenge.Entries?.map(entry => (
                        <div key={entry.id} className="tile">
                            <img src={entry.Photo?.imageUrl} alt="Entry" />
                            <div style={{ padding: '0.5rem' }}>
                                <p>By {entry.User?.name}</p>
                                <p>Votes: {entry.votesCount}</p>
                                <button onClick={() => vote(entry.id)}>Vote</button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </RequireAuth>
    );
}
