'use client';

import { useState, useRef } from 'react';
import RequireAuth from '@/components/RequireAuth';
import api from '@/src/lib/api';
import { Upload, Image as ImageIcon, MapPin, Calendar, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [date, setDate] = useState('');
    const [visibility, setVisibility] = useState('private');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [status, setStatus] = useState('');
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFile = (file) => {
        if (file && file.type.startsWith('image/')) {
            setImage(file);
            const reader = new FileReader();
            reader.onload = (e) => setPreview(e.target.result);
            reader.readAsDataURL(file);
            setStatus('');
        } else {
            setStatus('Please select a valid image file');
        }
    };

    const onUpload = async (event) => {
        event.preventDefault();
        if (!image) return;

        const metadata = { title, description, location, date };
        const payload = new FormData();
        payload.append('image', image);
        payload.append('visibility', visibility);
        payload.append('metadata', JSON.stringify(metadata));

        try {
            setUploading(true);
            setStatus('');
            await api.post('/photos/upload', payload);
            setStatus('success');

            // Reset form after success
            setTimeout(() => {
                setTitle('');
                setDescription('');
                setLocation('');
                setDate('');
                setImage(null);
                setPreview(null);
                setStatus('');
            }, 2000);
        } catch (err) {
            setStatus(err?.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <RequireAuth>
            <div className="dashboard-container">
                {/* Hero Section */}
                <section className="hero-section">
                    <div className="hero-content">
                        <h1 className="hero-title">
                            📸 Photographer Dashboard
                        </h1>
                        <p className="hero-subtitle">
                            Upload, organize, and collaborate from one powerful workspace
                        </p>

                        <div className="stats-row">
                            <div className="stat-card">
                                <div className="stat-icon upload-icon">
                                    <Upload size={24} />
                                </div>
                                <h3>Upload Ready</h3>
                                <p>20MB per image with full metadata control</p>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon album-icon">
                                    <ImageIcon size={24} />
                                </div>
                                <h3>Shared Albums</h3>
                                <p>Collaborative album workflows</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Upload Section */}
                <section className="upload-section">
                    <div className="upload-card">
                        <h2 className="section-title">
                            <Upload size={24} />
                            Upload New Photo
                        </h2>

                        <form className="upload-form" onSubmit={onUpload}>
                            {/* Drag & Drop Zone */}
                            <div
                                className={`drop-zone ${dragActive ? 'drag-active' : ''} ${preview ? 'has-preview' : ''}`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {preview ? (
                                    <div className="preview-container">
                                        <img src={preview} alt="Preview" className="preview-image" />
                                        <button
                                            type="button"
                                            className="change-image-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setImage(null);
                                                setPreview(null);
                                            }}
                                        >
                                            Change Image
                                        </button>
                                    </div>
                                ) : (
                                    <div className="drop-zone-content">
                                        <Upload size={48} className="upload-icon" />
                                        <p className="drop-text-primary">
                                            Drag and drop your photo here
                                        </p>
                                        <p className="drop-text-secondary">
                                            or click to browse
                                        </p>
                                        <span className="file-format-hint">
                                            Supports: JPG, PNG, GIF (max 20MB)
                                        </span>
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFile(e.target.files?.[0])}
                                    className="file-input-hidden"
                                    required
                                />
                            </div>

                            {/* Metadata Fields */}
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">
                                        <ImageIcon size={16} />
                                        Title *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter photo title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="form-input"
                                        required
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        placeholder="Tell the story behind this photo..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="form-textarea"
                                        rows={3}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        <MapPin size={16} />
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Where was this taken?"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className="form-input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        <Calendar size={16} />
                                        Date Taken
                                    </label>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="form-input"
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label className="form-label">
                                        {visibility === 'public' ? <Eye size={16} /> : <EyeOff size={16} />}
                                        Visibility
                                    </label>
                                    <div className="visibility-toggle">
                                        <button
                                            type="button"
                                            className={`visibility-btn ${visibility === 'private' ? 'active' : ''}`}
                                            onClick={() => setVisibility('private')}
                                        >
                                            <EyeOff size={18} />
                                            Private
                                        </button>
                                        <button
                                            type="button"
                                            className={`visibility-btn ${visibility === 'public' ? 'active' : ''}`}
                                            onClick={() => setVisibility('public')}
                                        >
                                            <Eye size={18} />
                                            Public
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Status Messages */}
                            {status && (
                                <div className={`status-message ${status === 'success' ? 'success' : 'error'}`}>
                                    {status === 'success' ? (
                                        <>
                                            <CheckCircle size={20} />
                                            Photo uploaded successfully!
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle size={20} />
                                            {status}
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={uploading || !image}
                            >
                                {uploading ? (
                                    <>
                                        <span className="spinner"></span>
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload size={20} />
                                        Upload Photo
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </section>

                <style jsx>{`
          .dashboard-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
          }

          /* Hero Section */
          .hero-section {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 24px;
            padding: 3rem;
            margin-bottom: 2rem;
            color: white;
            box-shadow: 0 20px 60px rgba(102, 126, 234, 0.3);
          }

          .hero-title {
            font-size: 2.5rem;
            font-weight: 700;
            margin: 0 0 0.5rem 0;
          }

          .hero-subtitle {
            font-size: 1.125rem;
            opacity: 0.95;
            margin-bottom: 2rem;
          }

          .stats-row {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
          }

          .stat-card {
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(10px);
            border-radius: 16px;
            padding: 1.5rem;
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: transform 0.2s;
          }

          .stat-card:hover {
            transform: translateY(-4px);
          }

          .stat-icon {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1rem;
          }

          .upload-icon {
            background: rgba(76, 201, 240, 0.3);
          }

          .album-icon {
            background: rgba(255, 107, 107, 0.3);
          }

          .stat-card h3 {
            font-size: 1.25rem;
            font-weight: 600;
            margin: 0 0 0.5rem 0;
          }

          .stat-card p {
            font-size: 0.875rem;
            margin: 0;
            opacity: 0.9;
          }

          /* Upload Section */
          .upload-section {
            background: white;
            border-radius: 24px;
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
          }

          .upload-card {
            padding: 2.5rem;
          }

          .section-title {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            font-size: 1.75rem;
            font-weight: 600;
            margin: 0 0 2rem 0;
            color: #2d3748;
          }

          /* Form */
          .upload-form {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
          }

          /* Drop Zone */
          .drop-zone {
            border: 2px dashed #cbd5e0;
            border-radius: 16px;
            padding: 3rem;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s;
            background: #f7fafc;
          }

          .drop-zone:hover {
            border-color: #667eea;
            background: #edf2f7;
          }

          .drop-zone.drag-active {
            border-color: #667eea;
            background: #e6f0ff;
          }

          .drop-zone.has-preview {
            padding: 1rem;
            border-style: solid;
          }

          .drop-zone-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.75rem;
          }

          .upload-icon {
            color: #667eea;
            margin-bottom: 0.5rem;
          }

          .drop-text-primary {
            font-size: 1.125rem;
            font-weight: 600;
            color: #2d3748;
            margin: 0;
          }

          .drop-text-secondary {
            font-size: 0.875rem;
            color: #718096;
            margin: 0;
          }

          .file-format-hint {
            font-size: 0.75rem;
            color: #a0aec0;
            margin-top: 0.5rem;
          }

          .preview-container {
            position: relative;
            max-width: 100%;
          }

          .preview-image {
            max-width: 100%;
            max-height: 400px;
            border-radius: 12px;
            object-fit: contain;
          }

          .change-image-btn {
            margin-top: 1rem;
            padding: 0.5rem 1rem;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.875rem;
            transition: all 0.2s;
          }

          .change-image-btn:hover {
            background: #edf2f7;
          }

          .file-input-hidden {
            display: none;
          }

          /* Form Grid */
          .form-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
          }

          .form-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          .form-group.full-width {
            grid-column: 1 / -1;
          }

          .form-label {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.875rem;
            font-weight: 600;
            color: #4a5568;
          }

          .form-input,
          .form-textarea {
            padding: 0.75rem 1rem;
            border:1px solid #e2e8f0;
            border-radius: 12px;
            font-size: 1rem;
            transition: all 0.2s;
            background: white;
          }

          .form-input:focus,
          .form-textarea:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          }

          .form-textarea {
            resize: vertical;
            font-family: inherit;
          }

          /* Visibility Toggle */
          .visibility-toggle {
            display: flex;
            gap: 0.75rem;
          }

          .visibility-btn {
            flex: 1;
            padding: 0.75rem 1rem;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            background: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            font-size: 0.875rem;
            font-weight: 600;
            color: #718096;
            transition: all 0.2s;
          }

          .visibility-btn:hover {
            border-color: #cbd5e0;
          }

          .visibility-btn.active {
            border-color: #667eea;
            background: #edf2f7;
            color: #667eea;
          }

          /* Status Message */
          .status-message {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 1rem;
            border-radius: 12px;
            font-size: 0.875rem;
            font-weight: 500;
          }

          .status-message.success {
            background: #d4edda;
            color: #155724;
          }

          .status-message.error {
            background: #f8d7da;
            color: #721c24;
          }

          /* Submit Button */
          .submit-btn {
            padding: 1rem 2rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
          }

          .submit-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
          }

          .submit-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .spinner {
            width: 20px;
            height: 20px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          /* Responsive */
          @media (max-width: 768px) {
            .dashboard-container {
              padding: 1rem;
            }

            .hero-section {
              padding: 2rem 1.5rem;
            }

            .hero-title {
              font-size: 1.75rem;
            }

            .upload-card {
              padding: 1.5rem;
            }

            .form-grid {
              grid-template-columns: 1fr;
            }

            .form-group {
              grid-column: 1;
            }

            .drop-zone {
              padding: 2rem 1rem;
            }
          }
        `}</style>
            </div>
        </RequireAuth>
    );
}
