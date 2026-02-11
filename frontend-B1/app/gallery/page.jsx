'use client';

import { useEffect, useState } from 'react';
import RequireAuth from '@/components/RequireAuth';
import PhotoLightbox from '@/components/PhotoLightbox';
import api from '@/src/lib/api';
import { Grid, Filter, Search, Image as ImageIcon } from 'lucide-react';

export default function GalleryPage() {
    const [photos, setPhotos] = useState([]);
    const [filteredPhotos, setFilteredPhotos] = useState([]);
    const [activePhoto, setActivePhoto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('masonry'); // masonry, grid

    useEffect(() => {
        api.get('/photos')
            .then((res) => {
                const fetchedPhotos = res.data.photos || [];
                setPhotos(fetchedPhotos);
                setFilteredPhotos(fetchedPhotos);
            })
            .catch(() => {
                setPhotos([]);
                setFilteredPhotos([]);
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredPhotos(photos);
        } else {
            const filtered = photos.filter(photo =>
                photo.metadata?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                photo.metadata?.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                photo.metadata?.location?.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredPhotos(filtered);
        }
    }, [searchQuery, photos]);

    return (
        <RequireAuth>
            <div className="gallery-container">
                {/* Header */}
                <div className="gallery-header">
                    <div className="header-content">
                        <h1 className="gallery-title">
                            <ImageIcon size={28} />
                            Photo Gallery
                        </h1>
                        <p className="gallery-subtitle">
                            Your complete photo collection with advanced search and filtering
                        </p>
                    </div>

                    {/* Controls */}
                    <div className="gallery-controls">
                        {/* Search */}
                        <div className="search-box">
                            <Search size={20} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search by title, description, or location..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-input"
                            />
                        </div>

                        {/* View Toggle */}
                        <div className="view-toggle">
                            <button
                                className={`toggle-btn ${viewMode === 'masonry' ? 'active' : ''}`}
                                onClick={() => setViewMode('masonry')}
                                title="Masonry View"
                            >
                                <Grid size={20} />
                            </button>
                            <button
                                className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                onClick={() => setViewMode('grid')}
                                title="Grid View"
                            >
                                <Filter size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Gallery Grid */}
                {loading ? (
                    <div className="gallery-loading">
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="skeleton-photo"></div>
                        ))}
                    </div>
                ) : filteredPhotos.length === 0 ? (
                    <div className="empty-gallery">
                        <div className="empty-icon">
                            <ImageIcon size={64} />
                        </div>
                        <h3>No photos found</h3>
                        <p>
                            {searchQuery ?
                                `No results for "${searchQuery}". Try a different search term.` :
                                'Start by uploading your first photo from the dashboard'
                            }
                        </p>
                    </div>
                ) : (
                    <div className={`gallery-grid ${viewMode}`}>
                        {filteredPhotos.map((photo, index) => (
                            <div
                                key={photo._id}
                                className="photo-tile"
                                onClick={() => setActivePhoto(photo)}
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <div className="photo-image-wrapper">
                                    <img
                                        src={photo.imageUrl}
                                        alt={photo.metadata?.title || 'photo'}
                                        loading="lazy"
                                        className="photo-image"
                                    />
                                    <div className="photo-overlay">
                                        <div className="photo-info">
                                            <h4 className="photo-title">
                                                {photo.metadata?.title || 'Untitled'}
                                            </h4>
                                            {photo.metadata?.location && (
                                                <span className="photo-location">
                                                    📍 {photo.metadata.location}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Lightbox */}
                <PhotoLightbox photo={activePhoto} onClose={() => setActivePhoto(null)} />

                <style jsx>{`
          .gallery-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 2rem;
          }

          /* Header */
          .gallery-header {
            margin-bottom: 2rem;
          }

          .header-content {
            margin-bottom: 1.5rem;
          }

          .gallery-title {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            font-size: 2rem;
            font-weight: 700;
            color: #1a202c;
            margin: 0 0 0.5rem 0;
          }

          .gallery-subtitle {
            color: #718096;
            font-size: 1rem;
            margin: 0;
          }

          /* Controls */
          .gallery-controls {
            display: flex;
            gap: 1rem;
            align-items: center;
            flex-wrap: wrap;
          }

          .search-box {
            flex: 1;
            min-width: 300px;
            position: relative;
          }

          .search-icon {
            position: absolute;
            left: 1rem;
            top: 50%;
            transform: translateY(-50%);
            color: #a0aec0;
            pointer-events: none;
          }

          .search-input {
            width: 100%;
            padding: 0.875rem 1rem 0.875rem 3rem;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            font-size: 0.938rem;
            transition: all 0.2s;
            background: white;
          }

          .search-input:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          }

          .view-toggle {
            display: flex;
            gap: 0.5rem;
            background: white;
            padding: 0.375rem;
            border-radius: 10px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          }

          .toggle-btn {
            padding: 0.625rem;
            border: none;
            background: transparent;
            color: #a0aec0;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .toggle-btn:hover {
            background: #edf2f7;
            color: #4a5568;
          }

          .toggle-btn.active {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }

          /* Gallery Grid */
          .gallery-grid {
            display: grid;
            gap: 1.5rem;
          }

          .gallery-grid.masonry {
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            grid-auto-rows: 20px;
          }

          .gallery-grid.grid {
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          }

          .photo-tile {
            cursor: pointer;
            border-radius: 16px;
            overflow: hidden;
            background: white;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
            transition: all 0.3s;
            animation: fadeInScale 0.4s ease forwards;
            opacity: 0;
          }

          .masonry .photo-tile {
            grid-row-end: span var(--row-span, 10);
          }

          .photo-tile:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          }

          @keyframes fadeInScale {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          .photo-image-wrapper {
            position: relative;
            width: 100%;
            overflow: hidden;
          }

          .grid .photo-image-wrapper {
            aspect-ratio: 4 / 3;
          }

          .photo-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
            transition: transform 0.3s;
          }

          .photo-tile:hover .photo-image {
            transform: scale(1.05);
          }

          .photo-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(
              to top,
              rgba(0, 0, 0, 0.8) 0%,
              rgba(0, 0, 0, 0.4) 50%,
              transparent 100%
            );
            opacity: 0;
            transition: opacity 0.3s;
            display: flex;
            align-items: flex-end;
            padding: 1.25rem;
          }

          .photo-tile:hover .photo-overlay {
            opacity: 1;
          }

          .photo-info {
            color: white;
            width: 100%;
          }

          .photo-title {
            font-size: 1rem;
            font-weight: 600;
            margin: 0 0 0.25rem 0;
            line-height: 1.3;
          }

          .photo-location {
            font-size: 0.813rem;
            opacity: 0.9;
          }

          /* Empty State */
          .empty-gallery {
            background: white;
            border-radius: 16px;
            padding: 4rem 2rem;
            text-align: center;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
          }

          .empty-icon {
            color: #cbd5e0;
            margin-bottom: 1.5rem;
          }

          .empty-gallery h3 {
            font-size: 1.5rem;
            font-weight: 600;
            color: #2d3748;
            margin: 0 0 0.5rem 0;
          }

          .empty-gallery p {
            color: #718096;
            margin: 0;
          }

          /* Loading State */
          .gallery-loading {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 1.5rem;
          }

          .skeleton-photo {
            height: 280px;
            border-radius: 16px;
            background: linear-gradient(90deg, #edf2f7 25%, #e2e8f0 50%, #edf2f7 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
          }

          @keyframes shimmer {
            0% {
              background-position: 200% 0;
            }
            100% {
              background-position: -200% 0;
            }
          }

          /* Responsive */
          @media (max-width: 768px) {
            .gallery-container {
              padding: 1rem;
            }

            .gallery-title {
              font-size: 1.75rem;
            }

            .gallery-controls {
              flex-direction: column;
              align-items: stretch;
            }

            .search-box {
              min-width: auto;
            }

            .view-toggle {
              width: 100%;
              justify-content: center;
            }

            .gallery-grid.masonry,
            .gallery-grid.grid {
              grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
              gap: 1rem;
            }
          }
        `}</style>

                {/* Dynamic row spanning for masonry layout */}
                <script dangerouslySetInnerHTML={{
                    __html: `
            if (typeof window !== 'undefined') {
              setTimeout(() => {
                document.querySelectorAll('.masonry .photo-tile').forEach(tile => {
                  const img = tile.querySelector('img');
                  if (img && img.complete) {
                    const rowSpan = Math.ceil((img.offsetHeight + 24) / 20);
                    tile.style.setProperty('--row-span', rowSpan);
                  } else if (img) {
                    img.addEventListener('load', () => {
                      const rowSpan = Math.ceil((img.offsetHeight + 24) / 20);
                      tile.style.setProperty('--row-span', rowSpan);
                    });
                  }
                });
              }, 100);
            }
          `
                }} />
            </div>
        </RequireAuth>
    );
}
