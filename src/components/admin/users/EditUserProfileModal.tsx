import { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Upload, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { ProfilesUpdate, ProfileRow } from '../../../lib/database.types';

interface EditUserProfileModalProps {
  user: {
    id: string;
    full_name: string | null;
    email: string;
    phone: string | null;
    profile_photo: string | null;
    bio?: string | null;
  };
  onClose: () => void;
  onSaveSuccess: () => void;
}

export function EditUserProfileModal({ user, onClose, onSaveSuccess }: EditUserProfileModalProps) {
  const [formData, setFormData] = useState<ProfilesUpdate>({
    full_name: user.full_name || '',
    phone: user.phone || '',
    bio: user.bio || '',
  });
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(user.profile_photo || null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Load bio if it wasn't initially passed (e.g., if user object was partial)
    const fetchBio = async () => {
      if (!user.bio) {
        const { data, error } = await supabase
          .from('profiles')
          .select('bio')
          .eq('id', user.id)
          .maybeSingle();
        if (data) {
          // Cast data to ProfileRow to access bio property safely
          setFormData(prev => ({ ...prev, bio: (data as ProfileRow).bio || '' }));
        }
        if (error) console.error('Error fetching user bio:', error);
      }
    };
    fetchBio();
  }, [user.id, user.bio]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Profile photo must be less than 5MB');
        setProfilePhotoFile(null);
        return;
      }
      setProfilePhotoFile(file);
      setError('');
    }
  };

  const uploadPhoto = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/profile/${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('course_assets')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) throw new Error('Failed to upload photo: ' + uploadError.message);

    const { data: publicUrlData } = supabase.storage
      .from('course_assets')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    let photoUrl = currentPhotoUrl;

    try {
      if (profilePhotoFile) {
        photoUrl = await uploadPhoto(profilePhotoFile);
      }

      const updatePayload: ProfilesUpdate = {
        full_name: formData.full_name,
        phone: formData.phone,
        bio: formData.bio,
        profile_photo: photoUrl,
      };

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updatePayload as ProfilesUpdate)
        .eq('id', user.id);
      if (updateError) throw updateError;

      setCurrentPhotoUrl(photoUrl);
      setProfilePhotoFile(null);
      setMessage('Profile updated successfully!');
      onSaveSuccess(); // Notify parent to reload users
      setTimeout(() => {
        setMessage('');
        onClose();
      }, 1500);
    } catch (err: any) {
      setError('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full shadow-2xl">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center">
            <User className="h-6 w-6 mr-2 text-blue-600" />
            Edit User Profile
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
          {message && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-green-600 text-sm">{message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Photo */}
            <div className="flex items-center space-x-6">
              <div className="flex-shrink-0">
                {currentPhotoUrl ? (
                  <img
                    className="h-20 w-20 rounded-full object-cover"
                    src={currentPhotoUrl}
                    alt="Profile"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                    <User className="h-10 w-10" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <label htmlFor="profilePhoto" className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Photo
                </label>
                <input
                  id="profilePhoto"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <label
                  htmlFor="profilePhoto"
                  className="cursor-pointer flex items-center justify-center w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition bg-white text-gray-700 text-sm"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  <span className="font-medium">
                    {profilePhotoFile ? profilePhotoFile.name : 'Change Photo'}
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1">Max 5MB, JPG or PNG</p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name || ''}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  value={user.email || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email changes are not editable here.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio (Optional)
              </label>
              <textarea
                value={formData.bio || ''}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tell us about yourself..."
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {saving ? (
                <>
                  <Loader className="h-5 w-5 mr-2 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}