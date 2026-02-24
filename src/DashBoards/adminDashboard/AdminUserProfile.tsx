import React, { useEffect, useState } from 'react';
import { useGetUserByIdQuery, useUpdateUserMutation } from '../../features/APIS/UserApi';
import { useSelector } from 'react-redux';
import type { RootState } from '../../App/store';
import { Moon, Sun } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';

const AdminUserProfile: React.FC = () => {
  const nationalId = useSelector((state: RootState) => state.auth.user?.nationalId);
  const { data: user, isLoading, refetch } = useGetUserByIdQuery(nationalId!, { skip: !nationalId });
  const [updateUser] = useUpdateUserMutation();

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    profileImageUrl: '',
    role: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const CLOUD_NAME = 'dwibg4vvf';
  const UPLOAD_PRESET = 'tickets_Profile';

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        profileImageUrl: user.profileImageUrl || '',
        role: user.role || '',
      });
      setPreviewUrl(user.profileImageUrl || '');
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return formData.profileImageUrl;

    const cloudFormData = new FormData();
    cloudFormData.append('file', imageFile);
    cloudFormData.append('upload_preset', UPLOAD_PRESET);

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        cloudFormData,
        {
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            setUploadProgress(percent);
          },
        }
      );

      return response.data.secure_url;
    } catch (error) {
      console.error('Image upload failed:', error);
      Swal.fire('Error', 'Failed to upload profile image.', 'error');
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let uploadedUrl = formData.profileImageUrl;
    if (imageFile) {
      const url = await uploadImage();
      if (url) uploadedUrl = url;
    }

    try {
      await updateUser({
        nationalId: nationalId!,
        ...formData,
        profileImageUrl: uploadedUrl,
      }).unwrap();

      Swal.fire({
        icon: 'success',
        title: 'Profile Updated!',
        text: 'Your changes have been saved.',
        timer: 2000,
        showConfirmButton: false,
      });

      setEditMode(false);
      setImageFile(null);
      setUploadProgress(0);
      refetch();
    } catch (err) {
      console.error('Update failed:', err);
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  if (isLoading || !user) return <div className="text-center">Loading user...</div>;

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 rounded-xl shadow-lg bg-base-100 text-base-content">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Profile</h1>
        <button onClick={toggleTheme} className="btn btn-circle btn-ghost">
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </button>
      </div>

      <div className="flex flex-col items-center gap-4">
        <img
          src={previewUrl || '/default-avatar.png'}
          alt="Profile"
          className="w-32 h-32 rounded-full object-cover border"
        />
        {editMode && (
          <>
            <input type="file" accept="image/*" onChange={handleImageChange} className="mt-2" />
            {uploadProgress > 0 && (
              <div className="w-full bg-gray-300 h-2 rounded">
                <div
                  className="bg-blue-600 h-2 rounded transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </>
        )}
        {!editMode && (
          <h2 className="text-xl font-bold">
            {user.firstName} {user.lastName}
          </h2>
        )}
      </div>

      {editMode ? (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            className="input input-bordered w-full"
            required
          />
          <input
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            className="input input-bordered w-full"
            required
          />
          <input
            name="email"
            value={formData.email}
            disabled
            className="input input-bordered w-full bg-gray-100 cursor-not-allowed"
          />
          <input
            name="role"
            value={formData.role}
            disabled
            className="input input-bordered w-full bg-gray-100 cursor-not-allowed"
          />
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => setEditMode(false)}
              className="btn btn-outline"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-6 space-y-2 text-sm">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>National ID:</strong> {user.nationalId}</p>
          <p><strong>Role:</strong> {user.role || 'user'}</p>
          <button
            onClick={() => setEditMode(true)}
            className="mt-4 btn btn-accent"
          >
            Edit Profile
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminUserProfile;
