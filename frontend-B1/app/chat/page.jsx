'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import RequireAuth from '@/components/RequireAuth';
import { useAuth } from '@/src/context/AuthContext';
import api from '@/src/lib/api';
import { getSocket } from '@/src/lib/socket';
import { MessageCircle, Send, User, Search, Circle } from 'lucide-react';

export default function ChatPage() {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [targetUser, setTargetUser] = useState('');
    const [messages, setMessages] = useState([]);
    const [content, setContent] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        api.get('/auth/users').then((res) => {
            const all = res.data.users || [];
            setUsers(all.filter((u) => u._id !== user?._id));
        }).catch(err => {
            console.error('Failed to load users for chat:', err);
            setUsers([]);
        });
    }, [user?._id]);

    const loadMessages = async (recipient) => {
        if (!recipient) return;
        const res = await api.get('/messages', {
            params: {
                chatType: 'private',
                recipient,
            },
        });
        setMessages(res.data.messages || []);
    };

    useEffect(() => {
        loadMessages(targetUser).catch(() => setMessages([]));
    }, [targetUser]);

    useEffect(() => {
        const socket = getSocket();
        if (!socket || !targetUser) return;

        socket.emit('chat:join', { chatType: 'private', targetId: targetUser });

        const onMessage = (message) => {
            const isCurrent =
                message.chatType === 'private' &&
                ((message.sender?._id === user?._id && message.recipient === targetUser) ||
                    (message.sender?._id === targetUser && message.recipient === user?._id));
            if (isCurrent) {
                setMessages((prev) => [...prev, message]);
            }
        };

        socket.on('chat:message', onMessage);
        return () => socket.off('chat:message', onMessage);
    }, [targetUser, user?._id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const activeUser = useMemo(() => users.find((u) => u._id === targetUser), [users, targetUser]);

    const filteredUsers = useMemo(() => {
        if (!searchQuery.trim()) return users;
        return users.filter(u =>
            u.name?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [users, searchQuery]);

    const send = async (event) => {
        event.preventDefault();
        if (!targetUser || !content.trim()) return;

        const socket = getSocket();

        if (socket) {
            socket.emit('chat:send', {
                chatType: 'private',
                targetId: targetUser,
                content,
            });
        } else {
            await api.post('/messages', {
                chatType: 'private',
                recipient: targetUser,
                content,
            });
            await loadMessages(targetUser);
        }

        setContent('');
    };

    return (
        <RequireAuth>
            <div className="chat-container">
                <div className="chat-layout">
                    {/* Sidebar */}
                    <aside className="chat-sidebar">
                        <div className="sidebar-header">
                            <h2 className="sidebar-title">
                                <MessageCircle size={22} />
                                Messages
                            </h2>
                        </div>

                        <div className="sidebar-search">
                            <Search size={18} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search contacts..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-input"
                            />
                        </div>

                        <div className="contacts-list">
                            {filteredUsers.length === 0 ? (
                                <div className="empty-contacts">
                                    <MessageCircle size={32} />
                                    <p>No contacts found</p>
                                </div>
                            ) : (
                                filteredUsers.map((u) => (
                                    <button
                                        key={u._id}
                                        type="button"
                                        className={`contact-item ${targetUser === u._id ? 'active' : ''}`}
                                        onClick={() => setTargetUser(u._id)}
                                    >
                                        <div className="contact-avatar">
                                            {u.avatar ? (
                                                <img src={u.avatar} alt={u.name} />
                                            ) : (
                                                <div className="avatar-placeholder">
                                                    {u.name?.charAt(0)?.toUpperCase()}
                                                </div>
                                            )}
                                            <div className="online-indicator"></div>
                                        </div>
                                        <div className="contact-info">
                                            <span className="contact-name">{u.name}</span>
                                            <span className="contact-status">Online</span>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </aside>

                    {/* Main Chat Area */}
                    <div className="chat-main">
                        {activeUser ? (
                            <>
                                <div className="chat-header">
                                    <div className="chat-user-info">
                                        <div className="chat-avatar">
                                            {activeUser.avatar ? (
                                                <img src={activeUser.avatar} alt={activeUser.name} />
                                            ) : (
                                                <div className="avatar-placeholder">
                                                    {activeUser.name?.charAt(0)?.toUpperCase()}
                                                </div>
                                            )}
                                            <Circle size={12} className="online-dot" />
                                        </div>
                                        <div>
                                            <h1 className="chat-name">{activeUser.name}</h1>
                                            <span className="chat-status">Active now</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="messages-container">
                                    {messages.length === 0 ? (
                                        <div className="empty-messages">
                                            <MessageCircle size={48} />
                                            <p>No messages yet</p>
                                            <span>Start the conversation!</span>
                                        </div>
                                    ) : (
                                        messages.map((message, index) => {
                                            const isOwn = message.sender?._id === user?._id;
                                            return (
                                                <div
                                                    key={message._id || `${message.timestamp}-${index}`}
                                                    className={`message ${isOwn ? 'own' : 'other'}`}
                                                >
                                                    {!isOwn && (
                                                        <div className="message-avatar">
                                                            {activeUser.avatar ? (
                                                                <img src={activeUser.avatar} alt={activeUser.name} />
                                                            ) : (
                                                                <div className="avatar-placeholder-small">
                                                                    {activeUser.name?.charAt(0)?.toUpperCase()}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    <div className="message-bubble">
                                                        <p className="message-content">{message.content}</p>
                                                        <span className="message-time">
                                                            {new Date(message.timestamp || Date.now()).toLocaleTimeString([], {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                <form className="message-input-form" onSubmit={send}>
                                    <input
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="Type a message..."
                                        className="message-input"
                                    />
                                    <button type="submit" className="send-btn" disabled={!content.trim()}>
                                        <Send size={20} />
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="no-chat-selected">
                                <MessageCircle size={64} />
                                <h2>Select a contact</h2>
                                <p>Choose someone from your contacts to start chatting</p>
                            </div>
                        )}
                    </div>
                </div>

                <style jsx>{`
          .chat-container {
            height: calc(100vh - 80px);
            padding: 1.5rem;
            max-width: 1400px;
            margin: 0 auto;
          }

          .chat-layout {
            display: grid;
            grid-template-columns: 320px 1fr;
            height: 100%;
            gap: 1.5rem;
          }

          /* Sidebar */
          .chat-sidebar {
            background: white;
            border-radius: 20px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          }

          .sidebar-header {
            padding: 1.5rem;
            border-bottom: 1px solid #edf2f7;
          }

          .sidebar-title {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            font-size: 1.375rem;
            font-weight: 700;
            color: #2d3748;
            margin: 0;
          }

          .sidebar-search {
            padding: 1rem 1.5rem;
            position: relative;
          }

          .search-icon {
            position: absolute;
            left: 2.25rem;
            top: 50%;
            transform: translateY(-50%);
            color: #a0aec0;
            pointer-events: none;
          }

          .search-input {
            width: 100%;
            padding: 0.75rem 1rem 0.75rem 2.5rem;
            border: 2px solid #edf2f7;
            border-radius: 12px;
            font-size: 0.875rem;
            transition: all 0.2s;
          }

          .search-input:focus {
            outline: none;
            border-color: #667eea;
          }

          /* Contacts List */
          .contacts-list {
            flex: 1;
            overflow-y: auto;
            padding: 0.5rem;
          }

          .contact-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.875rem;
            border: none;
            background: transparent;
            width: 100%;
            text-align: left;
            cursor: pointer;
            border-radius: 12px;
            transition: all 0.2s;
            margin-bottom: 0.25rem;
          }

          .contact-item:hover {
            background: #f7fafc;
          }

          .contact-item.active {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }

          .contact-item.active .contact-name,
          .contact-item.active .contact-status {
            color: white;
          }

          .contact-avatar {
            position: relative;
            flex-shrink: 0;
          }

          .contact-avatar img,
          .avatar-placeholder {
            width: 46px;
            height: 46px;
            border-radius: 50%;
            object-fit: cover;
          }

          .avatar-placeholder {
            background: linear-gradient(135deg, #cbd5e0 0%, #a0aec0 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
            font-size: 1.125rem;
          }

          .online-indicator {
            position: absolute;
            bottom: 2px;
            right: 2px;
            width: 12px;
            height: 12px;
            background: #48bb78;
            border: 2px solid white;
            border-radius: 50%;
          }

          .contact-info {
            flex: 1;
            display: flex;
            flex-direction: column;
            min-width: 0;
          }

          .contact-name {
            font-weight: 600;
            font-size: 0.938rem;
            color: #2d3748;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .contact-status {
            font-size: 0.75rem;
            color: #a0aec0;
          }

          .empty-contacts {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 3rem 1rem;
            color: #a0aec0;
            text-align: center;
          }

          .empty-contacts p {
            margin: 0.5rem 0 0 0;
            font-size: 0.875rem;
          }

          /* Main Chat */
          .chat-main {
            background: white;
            border-radius: 20px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          }

          .chat-header {
            padding: 1.25rem 1.5rem;
            border-bottom: 1px solid #edf2f7;
          }

          .chat-user-info {
            display: flex;
            align-items: center;
            gap: 1rem;
          }

          .chat-avatar {
            position: relative;
            flex-shrink: 0;
          }

          .chat-avatar img,
          .chat-avatar .avatar-placeholder {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            object-fit: cover;
          }

          .online-dot {
            position: absolute;
            bottom: 2px;
            right: 2px;
            color: #48bb78;
            background: white;
            border-radius: 50%;
          }

          .chat-name {
            font-size: 1.125rem;
            font-weight: 600;
            color: #2d3748;
            margin: 0;
          }

          .chat-status {
            font-size: 0.75rem;
            color: #48bb78;
          }

          /* Messages */
           .messages-container {
            flex: 1;
            overflow-y: auto;
            padding: 1.5rem;
            display: flex;
            flex-direction: column;
            gap: 1rem;
            background: #f7fafc;
          }

          .message {
            display: flex;
            gap: 0.75rem;
            animation: messageSlide 0.3s ease;
          }

          @keyframes messageSlide {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .message.own {
            flex-direction: row-reverse;
          }

          .message-avatar {
            flex-shrink: 0;
          }

          .message-avatar img,
          .avatar-placeholder-small {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            object-fit: cover;
          }

          .avatar-placeholder-small {
            background: linear-gradient(135deg, #cbd5e0 0%, #a0aec0 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
            font-size: 0.875rem;
          }

          .message-bubble {
            max-width: 60%;
            padding: 0.875rem 1.125rem;
            border-radius: 18px;
            position: relative;
          }

          .message.other .message-bubble {
            background: white;
            border-bottom-left-radius: 4px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          }

          .message.own .message-bubble {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-bottom-right-radius: 4px;
          }

          .message-content {
            margin: 0 0 0.375rem 0;
            line-height: 1.5;
            word-wrap: break-word;
          }

          .message-time {
            font-size: 0.688rem;
            opacity: 0.7;
          }

          .empty-messages {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #a0aec0;
            gap: 0.5rem;
          }

          .empty-messages p {
            margin: 0;
            font-size: 1rem;
            font-weight: 600;
            color: #718096;
          }

          .empty-messages span {
            font-size: 0.875rem;
          }

          /* Message Input */
          .message-input-form {
            padding: 1.25rem 1.5rem;
            border-top: 1px solid #edf2f7;
            display: flex;
            gap: 0.75rem;
            background: white;
          }

          .message-input {
            flex: 1;
            padding: 0.875rem 1rem;
            border: 2px solid #edf2f7;
            border-radius: 24px;
            font-size: 0.938rem;
            transition: all 0.2s;
            font-family: inherit;
          }

          .message-input:focus {
            outline: none;
            border-color: #667eea;
          }

          .send-btn {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            color: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            flex-shrink: 0;
          }

          .send-btn:hover:not(:disabled) {
            transform: scale(1.05);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          }

          .send-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          /* No Chat Selected */
          .no-chat-selected {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #a0aec0;
            gap: 1rem;
          }

          .no-chat-selected h2 {
            margin: 0;
            color: #4a5568;
            font-size: 1.5rem;
          }

          .no-chat-selected p {
            margin: 0;
            font-size: 0.938rem;
          }

          /* Responsive */
          @media (max-width: 968px) {
            .chat-container {
              padding: 1rem;
            }

            .chat-layout {
              grid-template-columns: ${targetUser ? '0 1fr' : '1fr 0'};
              gap: 0;
            }

            .chat-sidebar {
              display: ${targetUser ? 'none' : 'flex'};
            }

            .chat-main {
              display: ${targetUser ? 'flex' : 'none'};
            }

            .message-bubble {
              max-width: 75%;
            }
          }
        `}</style>
            </div>
        </RequireAuth>
    );
}
