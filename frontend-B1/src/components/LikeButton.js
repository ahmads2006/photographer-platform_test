import { useState } from 'react';
import api from '../lib/api';

export default function LikeButton({ photoId, initialLiked, initialCount }) {
    const [liked, setLiked] = useState(initialLiked);
    const [count, setCount] = useState(initialCount || 0);
    const [loading, setLoading] = useState(false);

    const toggleLike = async () => {
        if (loading) return;
        setLoading(true);
        // Optimistic update
        const previousLiked = liked;
        const previousCount = count;

        setLiked(!liked);
        setCount(liked ? count - 1 : count + 1);

        try {
            if (previousLiked) {
                await api.delete(`/interactions/${photoId}/like`);
            } else {
                await api.post(`/interactions/${photoId}/like`);
            }
        } catch (error) {
            console.error('Failed to toggle like', error);
            // Revert on error
            setLiked(previousLiked);
            setCount(previousCount);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button onClick={toggleLike} className={`like-btn ${liked ? 'liked' : ''}`} disabled={loading}>
            <span className="icon">♥</span> {count}
        </button>
    );
}
