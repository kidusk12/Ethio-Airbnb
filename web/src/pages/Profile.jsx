import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Plus } from 'lucide-react';
import NavBar1 from '../components/NavBar1';
import { useAuth } from '../context/AuthContext';

const AdminProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [profile, setProfile] = useState({
    name: user?.name || 'Abebe Tesfaye',
    email: user?.email || 'abebe@ethiostays.com',
    avatar: null,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profileSaved, setProfileSaved] = useState(false);

  const updateProfileField = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setProfileSaved(false);
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateProfileField('avatar', reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = () => {
    console.log('Saving profile', profile);
    setProfile((prev) => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }));
    setProfileSaved(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <NavBar1
        userName={profile.name}
        userAvatar={profile.avatar}
      />

      <section className="pt-28 pb-20 px-6 max-w-[1200px] mx-auto">
        {/* Back button */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[14px] font-semibold text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft size={17} />
          Back
        </button>

        <h1 className="text-3xl md:text-[36px] font-bold font-serif text-foreground mb-8">
          Profile Settings
        </h1>

        <div className="bg-white rounded-3xl border border-border p-8 max-w-[560px] mx-auto shadow-sm">
          {/* Avatar upload with + icon on current image */}
          <div className="flex items-center gap-6 mb-8 pb-6 border-b border-border">
            <label className="relative w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center overflow-visible flex-shrink-0 cursor-pointer group shadow-sm">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
              <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                {profile.avatar ? (
                  <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary text-white font-bold text-[32px] flex items-center justify-center">
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* + Icon Badge Overlay on Image */}
              <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary group-hover:bg-[#c82333] text-white flex items-center justify-center shadow-lg border-2 border-white transition-all transform group-hover:scale-110">
                <Plus size={18} strokeWidth={3} />
              </div>
            </label>

            <div>
              <h3 className="font-bold text-[16px] text-foreground mb-1">
                Profile Photo
              </h3>
              <p className="text-[13px] text-muted-foreground">
                Click the photo or <strong>+</strong> badge to upload a new avatar.
              </p>
            </div>
          </div>

          {/* Name */}
          <div className="mb-5">
            <label className="block text-[14px] font-semibold text-foreground mb-1.5">
              Full name
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => updateProfileField('name', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border text-[15px] text-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Email */}
          <div className="mb-8">
            <label className="block text-[14px] font-semibold text-foreground mb-1.5">
              Email address
            </label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => updateProfileField('email', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border text-[15px] text-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Password */}
          <h3 className="text-[15px] font-bold text-foreground mb-4">
            Change password
          </h3>

          <div className="mb-4">
            <label className="block text-[14px] font-semibold text-foreground mb-1.5">
              Current password
            </label>
            <input
              type="password"
              value={profile.currentPassword}
              onChange={(e) => updateProfileField('currentPassword', e.target.value)}
              placeholder="Enter current password"
              className="w-full px-4 py-3 rounded-xl border border-border text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div>
              <label className="block text-[14px] font-semibold text-foreground mb-1.5">
                New password
              </label>
              <input
                type="password"
                value={profile.newPassword}
                onChange={(e) => updateProfileField('newPassword', e.target.value)}
                placeholder="At least 8 characters"
                className="w-full px-4 py-3 rounded-xl border border-border text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-[14px] font-semibold text-foreground mb-1.5">
                Confirm new password
              </label>
              <input
                type="password"
                value={profile.confirmPassword}
                onChange={(e) => updateProfileField('confirmPassword', e.target.value)}
                placeholder="Re-enter new password"
                className="w-full px-4 py-3 rounded-xl border border-border text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveProfile}
              className="bg-primary hover:bg-[#c82333] text-white px-7 py-3 rounded-xl text-[14px] font-bold transition-all shadow-sm"
            >
              Save changes
            </button>
            {profileSaved && (
              <span className="text-[14px] text-green-600 font-semibold">Changes saved successfully</span>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminProfile;