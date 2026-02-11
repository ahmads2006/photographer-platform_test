import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import PhotoUpload from './PhotoUpload';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [photos, setPhotos] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [groups, setGroups] = useState([]);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPhotos();
      fetchAlbums();
      fetchGroups();
    }
  }, [user]);

  const fetchPhotos = async () => {
    try {
      const res = await axios.get('/api/photos');
      setPhotos(res.data.slice(0, 6)); // Show latest 6 photos
    } catch (error) {
      console.error('Error fetching photos:', error);
    }
  };

  const fetchAlbums = async () => {
    try {
      const res = await axios.get('/api/albums');
      setAlbums(res.data.slice(0, 3)); // Show latest 3 albums
    } catch (error) {
      console.error('Error fetching albums:', error);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await axios.get('/api/groups');
      setGroups(res.data.slice(0, 3)); // Show latest 3 groups
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const handlePhotoUploaded = () => {
    setShowUpload(false);
    fetchPhotos();
  };

  if (!user) {
    return <div className="container mt-5"><h2>Please login to view your dashboard</h2></div>;
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-8">
          <h2>Welcome back, {user.username}!</h2>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4>Your Recent Photos</h4>
            <button className="btn btn-primary" onClick={() => setShowUpload(!showUpload)}>
              {showUpload ? 'Cancel' : 'Upload Photo'}
            </button>
          </div>

          {showUpload && <PhotoUpload onUploaded={handlePhotoUploaded} />}

          <div className="row">
            {photos.map(photo => (
              <div key={photo._id} className="col-md-4 mb-3">
                <div className="card">
                  <img
                    src={`http://localhost:5000/${photo.path}`}
                    className="card-img-top"
                    alt={photo.title}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                  <div className="card-body">
                    <h6 className="card-title">{photo.title}</h6>
                    <p className="card-text">{photo.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-md-4">
          <h4>Your Albums</h4>
          {albums.map(album => (
            <div key={album._id} className="card mb-3">
              <div className="card-body">
                <h6 className="card-title">{album.name}</h6>
                <p className="card-text">{album.description}</p>
                <small className="text-muted">{album.participants.length} participants</small>
              </div>
            </div>
          ))}

          <h4 className="mt-4">Your Groups</h4>
          {groups.map(group => (
            <div key={group._id} className="card mb-3">
              <div className="card-body">
                <h6 className="card-title">{group.name}</h6>
                <p className="card-text">{group.description}</p>
                <small className="text-muted">{group.members.length} members</small>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
