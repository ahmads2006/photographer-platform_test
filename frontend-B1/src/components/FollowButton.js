import { useState, useEffect } from 'react';
import api from '../lib/api';

export default function FollowButton({ userId, initialIsFollowing, onToggle }) {
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setIsFollowing(initialIsFollowing);
    }, [initialIsFollowing]);

    const toggleFollow = async () => {
        setLoading(true);
        try {
            if (isFollowing) {
                await api.delete(`/users/${userId}/follow`);
            } else {
                await api.post(`/users/${userId}/follow`);
            }
            setIsFollowing(!isFollowing);
            if (onToggle) onToggle(!isFollowing);
        } catch (error) {
            console.error('Failed to toggle follow', error);
            alert('Action failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={toggleFollow}
            disabled={loading}
            className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
        >
            {loading ? 'Processing...' : isFollowing ? 'Unfollow' : 'Follow'}
        </button>
    );
}
