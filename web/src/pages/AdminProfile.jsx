import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Camera } from 'lucide-react';
import Navbar1 from '../components/NavBar1';
import Footer from '../components/Footer';

const AdminProfile = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: 'Admin User',
    email: 'admin@ethiostays.com',
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
    // handle actual API update here
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
    <div className="min-h-screen bg-background">
      <Navbar1
        adminName={profile.name}
        adminAvatar={profile.avatar}
        onProfileClick={() => {}}
        onLogout={() => console.log('Logging out')}
      />

      <section className="pt-24 pb-20 px-6 max-w-[1200px] mx-auto">
        {/* Back button */}
        <button
          type="button"
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2 text-[14px] font-medium text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft size={18} />
          Back to dashboard
        </button>

        <p className="text-[11px] font-semibold text-primary tracking-[0.15em] mb-2 uppercase">
          Admin
        </p>
        <h1 className="text-3xl md:text-[36px] font-bold font-serif text-foreground mb-8">
          Profile settings
        </h1>

        <div className="bg-white rounded-2xl border border-border p-8 max-w-[560px] mx-auto">
          {/* Avatar upload */}
          <div className="flex items-center gap-5 mb-8">
            <div className="relative w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
              {profile.avatar ? (
                <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={30} className="text-primary" />
              )}
            </div>
            <div>
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-[14px] font-medium text-foreground hover:bg-gray-50 transition-colors cursor-pointer">
                <Camera size={16} />
                Change photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </label>
              <p className="text-[12px] text-muted-foreground mt-2">
                JPG or PNG, at least 200x200px.
              </p>
            </div>
          </div>

          {/* Name */}
          <div className="mb-5">
            <label className="block text-[14px] font-medium text-foreground mb-1.5">
              Full name
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => updateProfileField('name', e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-border text-[15px] text-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Email */}
          <div className="mb-8">
            <label className="block text-[14px] font-medium text-foreground mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => updateProfileField('email', e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-border text-[15px] text-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Password */}
          <h3 className="text-[15px] font-semibold text-foreground mb-4">
            Change password
          </h3>

          <div className="mb-4">
            <label className="block text-[14px] font-medium text-foreground mb-1.5">
              Current password
            </label>
            <input
              type="password"
              value={profile.currentPassword}
              onChange={(e) => updateProfileField('currentPassword', e.target.value)}
              placeholder="Enter current password"
              className="w-full px-4 py-3 rounded-lg border border-border text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div>
              <label className="block text-[14px] font-medium text-foreground mb-1.5">
                New password
              </label>
              <input
                type="password"
                value={profile.newPassword}
                onChange={(e) => updateProfileField('newPassword', e.target.value)}
                placeholder="At least 8 characters"
                className="w-full px-4 py-3 rounded-lg border border-border text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-foreground mb-1.5">
                Confirm new password
              </label>
              <input
                type="password"
                value={profile.confirmPassword}
                onChange={(e) => updateProfileField('confirmPassword', e.target.value)}
                placeholder="Re-enter new password"
                className="w-full px-4 py-3 rounded-lg border border-border text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveProfile}
              className="bg-primary hover:opacity-90 text-primary-foreground px-6 py-3 rounded-lg text-[15px] font-semibold transition-opacity"
            >
              Save changes
            </button>
            {profileSaved && (
              <span className="text-[14px] text-green-600 font-medium">Saved</span>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AdminProfile;