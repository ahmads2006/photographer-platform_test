import { useState, useEffect } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function CommentSection({ photoId, initialComments = [] }) {
    const { user } = useAuth();
    const [comments, setComments] = useState(initialComments);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);

    // If we want to fetch comments independently, we can add useEffect here.
    // For now assuming passed via props or parent fetches.

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setLoading(true);
        try {
            const res = await api.post(`/interactions/${photoId}/comments`, { content: newComment });
            // Append new comment. existing comments might lack full user object depending on API return
            // We might need to mock the user part or fetch updated list.
            // Backend returns { comment: { ... } }
            const added = { ...res.data.comment, User: user };
            setComments([...comments, added]);
            setNewComment('');
        } catch (error) {
            console.error('Failed to post comment', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="comment-section">
            <h3>Comments</h3>
            <ul className="comment-list">
                {comments.map((c) => (
                    <li key={c.id} className="comment">
                        <strong>{c.User?.name || 'User'}:</strong> {c.content}
                    </li>
                ))}
            </ul>
            {user && (
                <form onSubmit={handleSubmit} className="comment-form">
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        disabled={loading}
                    />
                    <button type="submit" disabled={loading || !newComment.trim()}>Post</button>
                </form>
            )}
        </div>
    );
}
