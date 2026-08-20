import React, { useState } from "react";
import { Plus } from "lucide-react";
import NavBar1 from "../components/NavBar1";

// ─── Design tokens (matches Dashboard.jsx) ───────────────────────────────────
const A = "#E8473F";

function Profile({ guestName, guestEmail, embedded = false }) {
  const [profile, setProfile] = useState({
    name:            guestName  || "Kidus",
    email:           guestEmail || "kidus@ethiostays.com",
    avatar:          null,
    currentPassword: "",
    newPassword:     "",
    confirmPassword: "",
  });
  const [saved, setSaved] = useState(false);

  function update(field, value) {
    setProfile((p) => ({ ...p, [field]: value }));
    setSaved(false);
  }

  function handleAvatarUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update("avatar", reader.result);
    reader.readAsDataURL(file);
  }

  function handleSave() {
    setProfile((p) => ({ ...p, currentPassword: "", newPassword: "", confirmPassword: "" }));
    setSaved(true);
  }

  const inputCls = "w-full px-4 py-3 rounded-xl border border-gray-200 text-[15px] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#E8473F] transition-colors bg-white";
  const labelCls = "block text-[14px] font-semibold text-gray-800 mb-1.5";

  const card = (
    /* Outer wrapper — full width, card centred */
    <div className="flex justify-center">
      <div className="w-full max-w-[560px] rounded-3xl overflow-hidden shadow-sm border border-gray-100">

        {/* ── RED top half — avatar + name only ── */}
        <div
          className="px-8 pt-8 pb-8 flex flex-col items-center gap-4"
          style={{ background: A }}
        >
          {/* Avatar upload */}
          <label className="relative cursor-pointer group flex-shrink-0">
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-white/30">
              {profile.avatar ? (
                <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-white font-bold text-[36px]"
                  style={{ background: "rgba(255,255,255,0.25)" }}
                >
                  {profile.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            {/* + badge */}
            <div
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-md transition-all group-hover:scale-110"
              style={{ background: "#222" }}
            >
              <Plus size={15} color="#fff" strokeWidth={3} />
            </div>
          </label>

          {/* Name + role */}
          <div className="text-center">
            <p className="text-white font-bold text-[20px] leading-tight">{profile.name}</p>
            <p className="text-white/70 text-[13px] mt-1">Guest · EthioStays</p>
            <p className="text-white/55 text-[12px] mt-0.5">Click the photo to change your avatar</p>
          </div>
        </div>

        {/* ── WHITE bottom half — form ── */}
        <div className="bg-white px-8 py-8">

          {/* Name */}
          <div className="mb-5">
            <label className={labelCls}>Full name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => update("name", e.target.value)}
              className={inputCls}
            />
          </div>

          {/* Email */}
          <div className="mb-8 pb-8 border-b border-gray-100">
            <label className={labelCls}>Email address</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => update("email", e.target.value)}
              className={inputCls}
            />
          </div>

          {/* Password section */}
          <h3 className="text-[15px] font-bold text-gray-900 mb-4">Change password</h3>

          <div className="mb-4">
            <label className={labelCls}>Current password</label>
            <input
              type="password"
              value={profile.currentPassword}
              onChange={(e) => update("currentPassword", e.target.value)}
              placeholder="Enter current password"
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div>
              <label className={labelCls}>New password</label>
              <input
                type="password"
                value={profile.newPassword}
                onChange={(e) => update("newPassword", e.target.value)}
                placeholder="At least 8 characters"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Confirm new password</label>
              <input
                type="password"
                value={profile.confirmPassword}
                onChange={(e) => update("confirmPassword", e.target.value)}
                placeholder="Re-enter new password"
                className={inputCls}
              />
            </div>
          </div>

          {/* Save */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              className="px-7 py-3 rounded-xl text-[14px] font-bold text-white shadow-sm transition-opacity hover:opacity-90"
              style={{ background: A }}
            >
              Save changes
            </button>
            {saved && (
              <span className="text-[14px] font-semibold text-green-600">Changes saved successfully</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Embedded inside another page (e.g. as a Dashboard tab) — just the card, no navbar/page chrome
  if (embedded) return card;

  // Standalone page — include the navbar and page padding
  return (
    <div className="min-h-screen" style={{ background: "#f7f6f4" }}>
      <NavBar1
        userName={profile.name}
        showDashboardLink={false}
        onProfileClick={() => {}}
      />
      <main className="max-w-[1200px] mx-auto px-5 md:px-8 lg:px-10 pt-24 pb-24">
        {card}
      </main>
    </div>
  );
}

export default Profile;