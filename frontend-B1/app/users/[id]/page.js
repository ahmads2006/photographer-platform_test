'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/src/lib/api';
import FollowButton from '@/src/components/FollowButton';
import RequireAuth from '@/components/RequireAuth';

export default function PublicProfilePage() {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({ followers: 0, following: 0 });
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        // We need an endpoint to get OTHER user's profile. 
        // Usually GET /users/:id. I didn't verify if authController.listUsers or similar supports getting one user.
        // I might need to add getPublicProfile to userController or authController.
        // Let's assume GET /users/:id exists or I need to add it.
        // Wait, the prompt asked for "Social profile page". 
        // I added listUsers but not getUser. Backend userController has getFollowers etc but not getUser details?
        // Let's check backend/controllers/userController.js.
        // It has followUser, unfollow, getFollowers, getFollowing.
        // It does NOT have getUser(id).
        // I need to add getUser(id) to userController.js and routes/users.js!
        // I will do that in parallel or before this works.

        // Assuming GET /api/users/:id works:
        api.get(`/users/${id}`) // This needs to be implemented!
            .then(res => {
                setUser(res.data.user);
                setStats({
                    followers: res.data.followersCount || 0,
                    following: res.data.followingCount || 0
                });
                setIsFollowing(res.data.isFollowing || false);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));

    }, [id]);

    if (loading) return <p>Loading...</p>;
    if (!user) return <p>User not found</p>;

    return (
        <RequireAuth>
            <section className="panel narrow">
                <div className="profile-header">
                    {user.avatar && <img src={user.avatar} alt="Avatar" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} />}
                    <div>
                        <h1>{user.name}</h1>
                        <p>Reputation: {user.reputationPoints || 0}</p>
                        <div className="stats-row" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                            <span><strong>{stats.followers}</strong> Followers</span>
                            <span><strong>{stats.following}</strong> Following</span>
                        </div>
                        <FollowButton userId={user.id} initialIsFollowing={isFollowing} />
                    </div>
                </div>
                {/* Gallery of user photos could go here */}
            </section>
        </RequireAuth>
    );
}
