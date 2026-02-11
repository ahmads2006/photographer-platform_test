'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/src/lib/api';
import RequireAuth from '@/components/RequireAuth';

export default function CreateChallengePage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/challenges', {
                title,
                description,
                startTime,
                endTime
            });
            router.push('/challenges');
        } catch (err) {
            alert('Failed to create challenge');
        }
    };

    return (
        <RequireAuth>
            <section className="panel narrow">
                <h1>Create Challenge</h1>
                <form className="stack-form" onSubmit={handleSubmit}>
                    <input
                        placeholder="Title"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        required
                    />
                    <textarea
                        placeholder="Description"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                    />
                    <label>Start Time</label>
                    <input
                        type="datetime-local"
                        value={startTime}
                        onChange={e => setStartTime(e.target.value)}
                        required
                    />
                    <label>End Time</label>
                    <input
                        type="datetime-local"
                        value={endTime}
                        onChange={e => setEndTime(e.target.value)}
                        required
                    />
                    <button type="submit">Create Challenge</button>
                </form>
            </section>
        </RequireAuth>
    );
}
