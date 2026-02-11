'use client';
import { useEffect } from 'react';
import { X, MapPin, Calendar, Camera, Heart, Share2, Download } from 'lucide-react';

export default function PhotoLightbox({ photo, onClose }) {
  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (photo) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [photo, onClose]);

  if (!photo) return null;

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <div className="lightbox-container" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button 
          type="button" 
          className="close-btn" 
          onClick={onClose}
          aria-label="Close lightbox"
        >
          <X size={24} strokeWidth={2} />
        </button>

        {/* Image Container */}
        <div className="image-wrapper">
          <img 
            src={photo.imageUrl} 
            alt={photo.metadata?.title || 'Photo'} 
            className="lightbox-image" 
          />
        </div>

        {/* Photo Information */}
        <div className="photo-info">
          <div className="info-header">
            <div className="title-section">
              <h2 className="photo-title">
                {photo.metadata?.title || 'Untitled Photo'}
              </h2>
              {photo.metadata?.description && (
                <p className="photo-description">{photo.metadata.description}</p>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="action-buttons">
              <button 
                type="button" 
                className="action-btn"
                aria-label="Like photo"
              >
                <Heart size={20} strokeWidth={2} />
              </button>
              <button 
                type="button" 
                className="action-btn"
                aria-label="Share photo"
              >
                <Share2 size={20} strokeWidth={2} />
              </button>
              <button 
                type="button" 
                className="action-btn"
                aria-label="Download photo"
              >
                <Download size={20} strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Metadata */}
          <div className="metadata-grid">
            {photo.metadata?.location && (
              <div className="metadata-item">
                <MapPin size={18} strokeWidth={2} />
                <span>{photo.metadata.location}</span>
              </div>
            )}
            
            {photo.metadata?.dateTaken && (
              <div className="metadata-item">
                <Calendar size={18} strokeWidth={2} />
                <span>{new Date(photo.metadata.dateTaken).toLocaleDateString()}</span>
              </div>
            )}
            
            {photo.metadata?.camera && (
              <div className="metadata-item">
                <Camera size={18} strokeWidth={2} />
                <span>{photo.metadata.camera}</span>
              </div>
            )}
          </div>

          {/* EXIF Data */}
          {photo.metadata?.exif && (
            <div className="exif-data">
              <h4>Camera Settings</h4>
              <div className="exif-grid">
                {photo.metadata.exif.aperture && (
                  <div className="exif-item">
                    <span className="exif-label">Aperture</span>
                    <span className="exif-value">f/{photo.metadata.exif.aperture}</span>
                  </div>
                )}
                {photo.metadata.exif.shutter && (
                  <div className="exif-item">
                    <span className="exif-label">Shutter</span>
                    <span className="exif-value">{photo.metadata.exif.shutter}</span>
                  </div>
                )}
                {photo.metadata.exif.iso && (
                  <div className="exif-item">
                    <span className="exif-label">ISO</span>
                    <span className="exif-value">{photo.metadata.exif.iso}</span>
                  </div>
                )}
                {photo.metadata.exif.focal && (
                  <div className="exif-item">
                    <span className="exif-label">Focal</span>
                    <span className="exif-value">{photo.metadata.exif.focal}mm</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .lightbox-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(0, 0, 0, 0.95);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .lightbox-container {
          position: relative;
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 2rem;
          max-width: 1600px;
          width: 100%;
          height: 90vh;
          animation: slideUp 0.4s ease;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Close Button */
        .close-btn {
          position: absolute;
          top: -3rem;
          right: 0;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
          backdrop-filter: blur(10px);
          z-index: 10;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: rotate(90deg);
        }

        /* Image Section */
        .image-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .lightbox-image {
          max-width: 100%;
          max-height: 100%;
          width: auto;
          height: auto;
          object-fit: contain;
          border-radius: 12px;
          animation: imageZoom 0.4s ease;
        }

        @keyframes imageZoom {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* Photo Info Section */
        .photo-info {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 2rem;
          overflow-y: auto;
          backdrop-filter: blur(20px);
        }

        .info-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .title-section {
          flex: 1;
        }

        .photo-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: white;
          margin: 0 0 0.5rem 0;
          line-height: 1.3;
        }

        .photo-description {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
          line-height: 1.6;
        }

        /* Action Buttons */
        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        /* Metadata Grid */
        .metadata-grid {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .metadata-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.95rem;
        }

        .metadata-item svg {
          color: rgba(255, 255, 255, 0.6);
          flex-shrink: 0;
        }

        /* EXIF Data */
        .exif-data {
          margin-top: 2rem;
        }

        .exif-data h4 {
          font-size: 1rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.9);
          margin: 0 0 1rem 0;
        }

        .exif-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .exif-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .exif-label {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .exif-value {
          font-size: 1rem;
          font-weight: 600;
          color: white;
        }

        /* Scrollbar Styling */
        .photo-info::-webkit-scrollbar {
          width: 8px;
        }

        .photo-info::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }

        .photo-info::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }

        .photo-info::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .lightbox-container {
            grid-template-columns: 1fr;
            grid-template-rows: 1fr auto;
            height: auto;
            max-height: 90vh;
          }

          .image-wrapper {
            min-height: 300px;
          }

          .photo-info {
            max-height: 40vh;
          }
        }

        @media (max-width: 768px) {
          .lightbox-overlay {
            padding: 1rem;
          }

          .close-btn {
            top: -2.5rem;
            width: 40px;
            height: 40px;
          }

          .photo-info {
            padding: 1.5rem;
          }

          .photo-title {
            font-size: 1.5rem;
          }

          .action-buttons {
            flex-wrap: wrap;
          }

          .exif-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}