import React, { useState } from 'react';
import axios from 'axios';

const PhotoUpload = ({ onUploaded }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    visibility: 'private',
    album: '',
    metadata: {}
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleMetadataChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      metadata: { ...formData.metadata, [name]: value }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError('');

    const uploadData = new FormData();
    uploadData.append('photo', file);
    uploadData.append('title', formData.title);
    uploadData.append('description', formData.description);
    uploadData.append('visibility', formData.visibility);
    if (formData.album) uploadData.append('album', formData.album);
    uploadData.append('metadata', JSON.stringify(formData.metadata));

    try {
      await axios.post('/api/photos/upload', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      onUploaded();
      // Reset form
      setFormData({
        title: '',
        description: '',
        visibility: 'private',
        album: '',
        metadata: {}
      });
      setFile(null);
    } catch (error) {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card mb-4">
      <div className="card-header">
        <h5>Upload Photo</h5>
      </div>
      <div className="card-body">
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="photo" className="form-label">Select Photo</label>
            <input
              type="file"
              className="form-control"
              id="photo"
              accept="image/*"
              onChange={handleFileChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="title" className="form-label">Title</label>
            <input
              type="text"
              className="form-control"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="description" className="form-label">Description</label>
            <textarea
              className="form-control"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="visibility" className="form-label">Visibility</label>
            <select
              className="form-select"
              id="visibility"
              name="visibility"
              value={formData.visibility}
              onChange={handleInputChange}
            >
              <option value="private">Private</option>
              <option value="public">Public</option>
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="album" className="form-label">Album (optional)</label>
            <input
              type="text"
              className="form-control"
              id="album"
              name="album"
              value={formData.album}
              onChange={handleInputChange}
              placeholder="Album ID"
            />
          </div>
          <div className="mb-3">
            <h6>Metadata (optional)</h6>
            <div className="row">
              <div className="col-md-4">
                <label htmlFor="dateTaken" className="form-label">Date Taken</label>
                <input
                  type="date"
                  className="form-control"
                  id="dateTaken"
                  name="dateTaken"
                  value={formData.metadata.dateTaken || ''}
                  onChange={handleMetadataChange}
                />
              </div>
              <div className="col-md-4">
                <label htmlFor="location" className="form-label">Location</label>
                <input
                  type="text"
                  className="form-control"
                  id="location"
                  name="location"
                  value={formData.metadata.location || ''}
                  onChange={handleMetadataChange}
                  placeholder="e.g., New York, NY"
                />
              </div>
              <div className="col-md-4">
                <label htmlFor="camera" className="form-label">Camera</label>
                <input
                  type="text"
                  className="form-control"
                  id="camera"
                  name="camera"
                  value={formData.metadata.camera || ''}
                  onChange={handleMetadataChange}
                  placeholder="e.g., Canon EOS R5"
                />
              </div>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload Photo'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PhotoUpload;
