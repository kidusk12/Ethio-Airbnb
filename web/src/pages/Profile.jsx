import React, { useState, useEffect } from "react";
import { Plus, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import NavBar1 from "../components/NavBar1";
import { useAuth } from "../context/AuthContext";
import { getMe, updateMe } from "../lib/api";

function Profile({ guestName, guestEmail, embedded = false }) {
  const { user, token, login } = useAuth();

  const [profile, setProfile] = useState({
    firstName:       "",
    middleName:      "",
    lastName:        "",
    email:           "",
    phoneNumber:     "",
    avatar:          null,
    currentPassword: "",
    newPassword:     "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading]   = useState(true);
  const [isSaving, setIsSaving]     = useState(false);
  const [saved, setSaved]           = useState(false);
  const [error, setError]           = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // ── Load profile from API ────────────────────────────────────────────────
  useEffect(() => {
    if (!token) { setIsLoading(false); return; }
    getMe(token)
      .then(({ status, body }) => {
        if (status === 200) {
          const u = body.data;
          setProfile((prev) => ({
            ...prev,
            firstName:   u.firstName   ?? "",
            middleName:  u.middleName  ?? "",
            lastName:    u.lastName    ?? "",
            email:       u.email       ?? "",
            phoneNumber: u.phoneNumber ?? "",
          }));
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [token]);

  function update(field, value) {
    setProfile((p) => ({ ...p, [field]: value }));
    setSaved(false);
    setError("");
    setFieldErrors((prev) => ({ ...prev, [field]: "" }));
  }

  function handleAvatarUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update("avatar", reader.result);
    reader.readAsDataURL(file);
  }

  const handleSave = async () => {
    setError(""); setFieldErrors({}); setSaved(false);

    // Client-side password match check
    if (profile.newPassword && profile.newPassword !== profile.confirmPassword) {
      setError("New passwords do not match."); return;
    }

    const payload = {};
    if (profile.firstName.trim())   payload.firstName   = profile.firstName.trim();
    if (profile.middleName.trim())  payload.middleName  = profile.middleName.trim();
    if (profile.lastName.trim())    payload.lastName    = profile.lastName.trim();
    if (profile.email.trim())       payload.email       = profile.email.trim();
    if (profile.phoneNumber.trim()) payload.phoneNumber = profile.phoneNumber.trim();
    if (profile.newPassword) {
      payload.newPassword     = profile.newPassword;
      payload.currentPassword = profile.currentPassword;
    }

    if (Object.keys(payload).length === 0) { setSaved(true); return; }

    setIsSaving(true);
    try {
      const { status, body } = await updateMe(token, payload);

      if (status === 200) {
        // Refresh the auth context user so NavBar shows updated name
        const updatedUser = body.data;
        login(updatedUser, token);
        setProfile((prev) => ({
          ...prev,
          firstName:       updatedUser.firstName   ?? prev.firstName,
          middleName:      updatedUser.middleName  ?? prev.middleName,
          lastName:        updatedUser.lastName    ?? prev.lastName,
          email:           updatedUser.email       ?? prev.email,
          phoneNumber:     updatedUser.phoneNumber ?? prev.phoneNumber,
          currentPassword: "",
          newPassword:     "",
          confirmPassword: "",
        }));
        setSaved(true);
        return;
      }

      if (status === 400 || status === 409) {
        const errs = body.errors ?? [];
        if (errs.length > 0) {
          const mapped = {};
          errs.forEach(({ field, message }) => { mapped[field] = message; });
          setFieldErrors(mapped);
          setError(body.message || "Please fix the errors below.");
        } else {
          setError(body.message || "Update failed.");
        }
        return;
      }

      setError(body.message || "Failed to save changes. Please try again.");
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setIsSaving(false);
    }
  };

  const displayName = profile.firstName
    ? [profile.firstName, profile.lastName].filter(Boolean).join(' ')
    : guestName || user?.firstName || "User";

  const inputCls = (field) =>
    `w-full px-4 py-3 rounded-xl border text-[15px] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#E8473F] transition-colors bg-white ${fieldErrors[field] ? 'border-red-400' : 'border-gray-200'}`;
  const labelCls = "block text-[14px] font-semibold text-gray-800 mb-1.5";

  const card = (
    <div className="flex justify-center">
      <div className="w-full max-w-[560px] rounded-3xl overflow-hidden shadow-sm border border-gray-100">

        {/* Red top section */}
        <div className="px-8 pt-8 pb-8 flex flex-col items-center gap-4" style={{ background: "#E8473F" }}>
          <label className="relative cursor-pointer group flex-shrink-0">
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-white/30">
              {profile.avatar ? (
                <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold text-[36px]" style={{ background: "rgba(255,255,255,0.25)" }}>
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-md transition-all group-hover:scale-110" style={{ background: "#222" }}>
              <Plus size={15} color="#fff" strokeWidth={3} />
            </div>
          </label>
          <div className="text-center">
            <p className="text-white font-bold text-[20px] leading-tight">{displayName}</p>
            <p className="text-white/70 text-[13px] mt-1">{user?.role === 'admin' ? 'Administrator' : user?.role === 'host' ? 'Host' : 'Guest'} · EthioStays</p>
            <p className="text-white/55 text-[12px] mt-0.5">Click the photo to change your avatar</p>
          </div>
        </div>

        {/* White form section */}
        <div className="bg-white px-8 py-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
              <Loader2 size={20} className="animate-spin text-primary" />
              <span>Loading profile…</span>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[13px] flex items-center gap-2">
                  <AlertCircle size={14} className="flex-shrink-0" />{error}
                </div>
              )}

              {/* Name fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className={labelCls}>First name</label>
                  <input type="text" value={profile.firstName} onChange={(e) => update("firstName", e.target.value)} className={inputCls('firstName')} />
                  {fieldErrors.firstName && <p className="mt-1 text-[12px] text-red-500">{fieldErrors.firstName}</p>}
                </div>
                <div>
                  <label className={labelCls}>Middle name</label>
                  <input type="text" value={profile.middleName} onChange={(e) => update("middleName", e.target.value)} className={inputCls('middleName')} />
                  {fieldErrors.middleName && <p className="mt-1 text-[12px] text-red-500">{fieldErrors.middleName}</p>}
                </div>
              </div>

              <div className="mb-5">
                <label className={labelCls}>Last name</label>
                <input type="text" value={profile.lastName} onChange={(e) => update("lastName", e.target.value)} className={inputCls('lastName')} />
                {fieldErrors.lastName && <p className="mt-1 text-[12px] text-red-500">{fieldErrors.lastName}</p>}
              </div>

              {/* Contact */}
              <div className="mb-5">
                <label className={labelCls}>Email address</label>
                <input type="email" value={profile.email} onChange={(e) => update("email", e.target.value)} className={inputCls('email')} />
                {fieldErrors.email && <p className="mt-1 text-[12px] text-red-500">{fieldErrors.email}</p>}
              </div>

              <div className="mb-8 pb-8 border-b border-gray-100">
                <label className={labelCls}>Phone number</label>
                <input type="tel" value={profile.phoneNumber} onChange={(e) => update("phoneNumber", e.target.value)} placeholder="+251 9..." className={inputCls('phoneNumber')} />
                {fieldErrors.phoneNumber && <p className="mt-1 text-[12px] text-red-500">{fieldErrors.phoneNumber}</p>}
              </div>

              {/* Password section */}
              <h3 className="text-[15px] font-bold text-gray-900 mb-4">Change password</h3>
              <div className="mb-4">
                <label className={labelCls}>Current password</label>
                <input type="password" value={profile.currentPassword} onChange={(e) => update("currentPassword", e.target.value)} placeholder="Enter current password" className={inputCls('currentPassword')} />
                {fieldErrors.currentPassword && <p className="mt-1 text-[12px] text-red-500">{fieldErrors.currentPassword}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div>
                  <label className={labelCls}>New password</label>
                  <input type="password" value={profile.newPassword} onChange={(e) => update("newPassword", e.target.value)} placeholder="At least 8 characters" className={inputCls('newPassword')} />
                  {fieldErrors.newPassword && <p className="mt-1 text-[12px] text-red-500">{fieldErrors.newPassword}</p>}
                </div>
                <div>
                  <label className={labelCls}>Confirm new password</label>
                  <input type="password" value={profile.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} placeholder="Re-enter new password" className={inputCls('confirmPassword')} />
                </div>
              </div>

              {/* Save */}
              <div className="flex items-center gap-3">
                <button type="button" onClick={handleSave} disabled={isSaving}
                  className="px-7 py-3 rounded-xl text-[14px] font-bold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60 flex items-center gap-2"
                  style={{ background: "#E8473F" }}>
                  {isSaving ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : "Save changes"}
                </button>
                {saved && (
                  <span className="text-[14px] font-semibold text-green-600 flex items-center gap-1">
                    <CheckCircle2 size={16} /> Saved
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  if (embedded) return card;

  return (
    <div className="min-h-screen" style={{ background: "#f7f6f4" }}>
      <NavBar1 userName={displayName} showDashboardLink={false} onProfileClick={() => {}} />
      <main className="max-w-[1200px] mx-auto px-5 md:px-8 lg:px-10 pt-24 pb-24">{card}</main>
    </div>
  );
}

export default Profile;
