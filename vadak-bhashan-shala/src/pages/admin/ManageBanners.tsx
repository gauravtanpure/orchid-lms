// pages/admin/ManageBanners.tsx

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Zap, EyeOff, CheckCircle, Image as ImageIcon } from 'lucide-react';

const BACKEND_API_URL = import.meta.env.VITE_REACT_APP_BACKEND_URL;


interface Banner {
  _id: string; 
  imageUrl: string;
  link: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Helper function to get auth token
const getAuthToken = () => {
  // Try different possible storage keys
  return localStorage.getItem('token') || 
         localStorage.getItem('authToken') || 
         localStorage.getItem('jwt') ||
         sessionStorage.getItem('token');
};

const ManageBanners = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState<Partial<Banner>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // --- Data Fetching (Read) ---
  const { data: banners, isLoading, error } = useQuery<Banner[]>({
    queryKey: ['banners'],
    queryFn: async () => {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in as admin.');
      }

      const res = await fetch(`${BACKEND_API_URL}/api/banners`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (res.status === 403) {
        throw new Error('Access denied. Admin privileges required.');
      }
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch banners');
      }
      
      return res.json();
    },
  });

  const activeBanner = banners?.find(b => b.isActive);

  // --- Mutations (Create, Update, Delete) ---
  const createMutation = useMutation({
    mutationFn: async ({ formData }: { formData: FormData }) => {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const res = await fetch(`${BACKEND_API_URL}/api/banners`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData, 
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create banner');
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      alert("Success: New banner created and image uploaded!");
      closeModal();
    },
    onError: (err: Error) => {
      alert(`Error creating banner: ${err.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<Banner> }) => {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const res = await fetch(`${BACKEND_API_URL}/api/banners/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update banner');
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      alert("Success: Banner updated!");
    },
    onError: (err: Error) => {
      alert(`Error updating banner: ${err.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const res = await fetch(`${BACKEND_API_URL}/api/banners/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete banner');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      alert("Success: Banner deleted!");
    },
    onError: (err: Error) => {
      alert(`Error deleting banner: ${err.message}`);
    },
  });


  // --- Handlers ---
  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();

    if (currentBanner._id) {
      // Edit: only link can be changed in this simple form
      updateMutation.mutate({ id: currentBanner._id, data: { link: currentBanner.link } });
    } else {
      // Create: requires file upload
      if (!selectedFile) {
        alert("Error: Please select a banner image file.");
        return;
      }

      const formData = new FormData();
      formData.append('bannerImage', selectedFile); 
      formData.append('link', currentBanner.link || '/');

      createMutation.mutate({ formData });
    }
  };

  const handleActivateBanner = (id: string) => {
    updateMutation.mutate({ id, data: { isActive: true } });
  };

  const handleDeactivateBanner = (id: string) => {
    updateMutation.mutate({ id, data: { isActive: false } });
  };

  const handleDeleteBanner = (id: string) => {
    if (window.confirm("Are you sure you want to delete this banner?")) {
      deleteMutation.mutate(id);
    }
  };

  // --- UI Handlers ---
  const openCreateModal = () => {
    setCurrentBanner({ link: '' });
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (banner: Banner) => {
    setCurrentBanner(banner);
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentBanner({});
    setSelectedFile(null);
  };

  // --- Render Functions ---
  if (isLoading) {
    return <div className="text-center p-12 text-gray-600">Loading banners...</div>;
  }

  if (error) {
    return (
      <div className="text-center p-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h2 className="text-red-800 font-bold text-lg mb-2">Authentication Error</h2>
          <p className="text-red-600 mb-4">{error.message}</p>
          <p className="text-sm text-gray-600">
            Please make sure you're logged in as an admin. You may need to log out and log back in.
          </p>
        </div>
      </div>
    );
  }

  const renderBannerList = () => (
    <div className="space-y-4">
      {banners?.length === 0 ? (
        <div className="text-center p-8 bg-white rounded-xl shadow">
          <p className="text-gray-500">No banners created yet. Click 'Add New Banner' to begin.</p>
        </div>
      ) : (
        banners?.map(banner => (
          <div 
            key={banner._id} 
            className={`p-4 rounded-xl shadow-lg flex items-center justify-between transition-all duration-300 ${
              banner.isActive 
                ? 'bg-blue-100 border-2 border-blue-500' 
                : 'bg-white border border-gray-200 hover:shadow-xl'
            }`}
          >
            <div className="flex-1 min-w-0 pr-4 flex items-center gap-4">
              <div className="w-20 h-10 bg-gray-200 rounded-md overflow-hidden relative">
                <ImageIcon className="w-6 h-6 text-gray-400 absolute inset-0 m-auto" />
                <img 
                  src={banner.imageUrl} 
                  alt="Banner Preview" 
                  className="w-full h-full object-cover opacity-70"
                  onError={(e) => { e.currentTarget.style.opacity = '0'; }}
                />
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-semibold truncate ${banner.isActive ? 'text-blue-800' : 'text-gray-800'}`}>
                  {banner.imageUrl.substring(banner.imageUrl.lastIndexOf('/') + 1, 50)}...
                </p>
                {banner.link && <p className="text-xs text-gray-500 truncate mt-0.5">Link: {banner.link}</p>}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {banner.isActive ? (
                <div className="flex items-center text-sm font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                  <CheckCircle className="w-4 h-4 mr-1" /> ACTIVE
                </div>
              ) : (
                <button
                  onClick={() => handleActivateBanner(banner._id)}
                  className="p-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  title="Publish Banner"
                  disabled={updateMutation.isPending}
                >
                  <Zap className="w-5 h-5" />
                </button>
              )}

              <button
                onClick={() => openEditModal(banner)}
                className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                title="Edit Banner"
                disabled={updateMutation.isPending}
              >
                <Edit className="w-5 h-5" />
              </button>
              
              {banner.isActive && (
                <button
                  onClick={() => handleDeactivateBanner(banner._id)}
                  className="p-2 text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
                  title="Unpublish Banner"
                  disabled={updateMutation.isPending}
                >
                  <EyeOff className="w-5 h-5" />
                </button>
              )}

              <button
                onClick={() => handleDeleteBanner(banner._id)}
                className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                title="Delete Banner"
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderModal = () => (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity ${isModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 m-4 transform transition-transform duration-300 scale-100">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-3 mb-4">
          {currentBanner._id ? 'Edit Banner Link' : 'Create New Banner'}
        </h2>
        <form onSubmit={handleSaveBanner} className="space-y-4">
          {!currentBanner._id && (
            <div>
              <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">
                Banner Image File <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                id="file"
                required={!currentBanner._id}
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-500 mt-1">Upload the banner image file (JPEG, PNG, WebP).</p>
            </div>
          )}
          
          {currentBanner._id && currentBanner.imageUrl && (
            <div className="mt-2 p-2 border border-gray-200 rounded-lg bg-gray-50">
              <p className="text-xs font-medium text-gray-600 mb-1">Current Image:</p>
              <img 
                src={currentBanner.imageUrl} 
                alt="Banner Preview" 
                className="w-full h-auto max-h-24 object-contain rounded"
              />
            </div>
          )}

          <div>
            <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-1">
              Call-to-Action Link (Optional)
            </label>
            <input
              type="text"
              id="link"
              value={currentBanner.link || ''}
              onChange={(e) => setCurrentBanner({ ...currentBanner, link: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
              placeholder="/courses"
            />
            <p className="text-xs text-gray-500 mt-1">The URL the banner should link to (e.g., /courses, /about).</p>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : (currentBanner._id ? 'Save Changes' : 'Create Banner')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="p-4 lg:p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Manage Home Screen Banners
        </h1>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-xl shadow-md hover:bg-green-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add New Banner
        </button>
      </div>
      
      {/* Active Banner Display */}
      <div className="p-5 bg-white rounded-xl shadow-lg border-l-4 border-blue-600">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">
          Current Active Home Screen Banner
        </h2>
        {activeBanner ? (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 flex items-center gap-4">
            <div className="w-24 h-12 bg-gray-200 rounded-md overflow-hidden relative">
              <ImageIcon className="w-8 h-8 text-gray-400 absolute inset-0 m-auto" />
              <img 
                src={activeBanner.imageUrl} 
                alt="Active Banner" 
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.opacity = '0'; }}
              />
            </div>
            <div>
              <p className="font-bold text-blue-700 truncate">{activeBanner.imageUrl.substring(activeBanner.imageUrl.lastIndexOf('/') + 1, 50)}...</p>
              <p className="text-sm text-blue-500 mt-1">Link: {activeBanner.link || 'None'}</p>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-700">No banner is currently active on the home screen.</p>
          </div>
        )}
      </div>

      {/* Banner List */}
      <h2 className="text-2xl font-semibold text-gray-900 mt-8">
        All Banners ({banners?.length || 0})
      </h2>
      {renderBannerList()}

      {/* Modal for Create/Edit */}
      {renderModal()}
    </div>
  );
};

export default ManageBanners;