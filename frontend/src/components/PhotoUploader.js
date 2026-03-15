import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { X, Upload } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export const PhotoUploader = ({ photos = [], onPhotosChange, maxPhotos = 10 }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    
    if (photos.length + files.length > maxPhotos) {
      toast.error(`Maximum ${maxPhotos} photos allowed`);
      return;
    }

    setUploading(true);

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('image', file);

        const response = await axios.post(`${API_URL}/api/upload/image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        const newPhoto = {
          url: `${API_URL}${response.data.url}`,
          caption: ''
        };

        onPhotosChange([...photos, newPhoto]);
      }

      toast.success('Photos uploaded');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
  };

  const updateCaption = (index, caption) => {
    const newPhotos = [...photos];
    newPhotos[index] = { ...newPhotos[index], caption };
    onPhotosChange(newPhotos);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {photos.map((photo, index) => (
          <div key={index} className="relative group">
            <img
              src={photo.url}
              alt={photo.caption || `Photo ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg"
            />
            <button
              onClick={() => removePhoto(index)}
              className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
            >
              <X className="h-4 w-4" />
            </button>
            <input
              type="text"
              placeholder="Caption (optional)"
              value={photo.caption || ''}
              onChange={(e) => updateCaption(index, e.target.value)}
              className="w-full mt-2 px-2 py-1 text-xs border rounded"
            />
          </div>
        ))}
        
        {photos.length < maxPhotos && (
          <label className="border-2 border-dashed rounded-lg h-32 flex items-center justify-center cursor-pointer hover:bg-muted/50 transition">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
            <div className="text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                {uploading ? 'Uploading...' : 'Upload Photos'}
              </p>
            </div>
          </label>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {photos.length}/{maxPhotos} photos • Max 5MB per image
      </p>
    </div>
  );
};
