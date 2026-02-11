import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Gallery = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const res = await axios.get('/api/photos');
      setPhotos(res.data);
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const openLightbox = (photo) => {
    setSelectedPhoto(photo);
  };

  const closeLightbox = () => {
    setSelectedPhoto(null);
  };

  if (loading) {
    return <div className="container mt-5 text-center"><div className="spinner-border" role="status"></div></div>;
  }

  return (
    <div className="container mt-4">
      <h2>Photo Gallery</h2>
      <div className="row">
        {photos.map(photo => (
          <div key={photo._id} className="col-lg-3 col-md-4 col-sm-6 mb-4">
            <div className="card h-100" onClick={() => openLightbox(photo)} style={{ cursor: 'pointer' }}>
              <img
                src={`http://localhost:5000/${photo.path}`}
                className="card-img-top"
                alt={photo.title}
                style={{ height: '200px', objectFit: 'cover' }}
              />
              <div className="card-body d-flex flex-column">
                <h6 className="card-title">{photo.title}</h6>
                <p className="card-text flex-grow-1">{photo.description}</p>
                <small className="text-muted">
                  By {photo.uploadedBy.username} • {new Date(photo.createdAt).toLocaleDateString()}
                </small>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div className="modal show d-block" tabIndex="-1" onClick={closeLightbox}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h5 className="modal-title">{selectedPhoto.title}</h5>
                <button type="button" className="btn-close" onClick={closeLightbox}></button>
              </div>
              <div className="modal-body text-center">
                <img
                  src={`http://localhost:5000/${selectedPhoto.path}`}
                  alt={selectedPhoto.title}
                  className="img-fluid"
                  style={{ maxHeight: '70vh' }}
                />
                <div className="mt-3">
                  <p>{selectedPhoto.description}</p>
                  {selectedPhoto.metadata && (
                    <div className="row text-start">
                      {selectedPhoto.metadata.dateTaken && (
                        <div className="col-md-3">
                          <strong>Date:</strong> {new Date(selectedPhoto.metadata.dateTaken).toLocaleDateString()}
                        </div>
                      )}
                      {selectedPhoto.metadata.location && (
                        <div className="col-md-3">
                          <strong>Location:</strong> {selectedPhoto.metadata.location}
                        </div>
                      )}
                      {selectedPhoto.metadata.camera && (
                        <div className="col-md-3">
                          <strong>Camera:</strong> {selectedPhoto.metadata.camera}
                        </div>
                      )}
                      {selectedPhoto.metadata.lens && (
                        <div className="col-md-3">
                          <strong>Lens:</strong> {selectedPhoto.metadata.lens}
                        </div>
                      )}
                    </div>
                  )}
                  <small className="text-muted">
                    Uploaded by {selectedPhoto.uploadedBy.username} on {new Date(selectedPhoto.createdAt).toLocaleDateString()}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
