import React, { useState, useEffect, useRef } from 'react';

/**
 * Modern, Ultra-Sleek, Premium Dark Mode "Edit Profile" Modal Dialog UI Component
 * Built with Tailwind CSS and React.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls visibility of the modal dialog
 * @param {Function} props.onClose - Callback function triggered when modal is closed
 * @param {Function} props.onSave - Callback function triggered when profile changes are saved
 * @param {Object} props.initialData - Initial user profile data
 * @param {string} props.initialData.fullName - User's full name
 * @param {string} props.initialData.username - User's handle / username
 * @param {string} props.initialData.phone - User's phone number
 * @param {string} props.initialData.avatarUrl - URL of user avatar image
 */
export default function EditProfileModal({
  isOpen = true,
  onClose = () => {},
  onSave = () => {},
  initialData = {
    fullName: 'SHAFAET HOSSEN SARIP',
    username: 'shafaet',
    phone: '+8801342697743',
    avatarUrl: 'profile.jpg'
  }
}) {
  const [fullName, setFullName] = useState(initialData.fullName || '');
  const [username, setUsername] = useState(initialData.username || '');
  const [phone, setPhone] = useState(initialData.phone || '');
  const [avatarPreview, setAvatarPreview] = useState(initialData.avatarUrl || '');
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState({});

  const fileInputRef = useRef(null);

  // Sync initial state on modal open
  useEffect(() => {
    if (isOpen) {
      setFullName(initialData.fullName || '');
      setUsername(initialData.username || '');
      setPhone(initialData.phone || '');
      setAvatarPreview(initialData.avatarUrl || '');
      setErrors({});
    }
  }, [isOpen, initialData]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Handle Photo Upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({ ...prev, avatar: 'Please select a valid image file.' }));
        return;
      }
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        setIsUploading(false);
        setErrors((prev) => ({ ...prev, avatar: null }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Remove Photo
  const handleRemovePhoto = () => {
    setAvatarPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle Submit Form
  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    }
    if (!username.trim()) {
      newErrors.username = 'Username is required.';
    } else if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
      newErrors.username = 'Only letters, numbers, and underscores allowed.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      fullName: fullName.trim(),
      username: username.trim(),
      phone: phone.trim(),
      avatarUrl: avatarPreview
    });
  };

  // Helper for initial fallback
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md transition-all duration-300 animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-title"
    >
      {/* 1. Modal Container */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-[#0F172A]/95 backdrop-blur-xl border border-slate-700/60 shadow-[0_0_50px_rgba(15,23,42,0.8)] p-6 sm:p-8 transition-all transform animate-scaleUp text-slate-100">

        {/* Glowing subtle top border accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/50 to-purple-500/50" />

        {/* 2. Header */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h2 id="modal-title" className="text-xl font-bold tracking-tight text-white font-sans">
                Edit Profile
              </h2>
              <p className="text-xs text-slate-400">Update your account details and profile picture</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-600"
            aria-label="Close Modal"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">

          {/* 3. Profile Photo Section */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl bg-slate-900/50 border border-slate-800/80">
            {/* Centered Circular Avatar */}
            <div className="relative group flex-shrink-0">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-blue-500/40 ring-4 ring-blue-500/20 shadow-[0_0_25px_rgba(59,130,246,0.25)] bg-slate-800 flex items-center justify-center">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Profile Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl sm:text-3xl font-bold text-blue-400 font-sans tracking-widest">
                    {getInitials(fullName)}
                  </span>
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Upload & Remove Sleek Buttons */}
            <div className="flex flex-col items-center sm:items-start gap-2.5 flex-grow">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Profile Photo</span>

              <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-start">
                {/* Upload Photo Button */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  className="hidden"
                  id="avatar-upload-input"
                />
                <label
                  htmlFor="avatar-upload-input"
                  className="cursor-pointer px-4 py-2 text-xs sm:text-sm font-medium rounded-xl border border-blue-500/60 text-blue-400 bg-blue-500/5 hover:bg-blue-500/15 hover:border-blue-400 active:scale-95 transition-all duration-200 flex items-center gap-2 shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span>Upload Photo</span>
                </label>

                {/* Remove Button */}
                {avatarPreview && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="px-3 py-2 text-xs sm:text-sm font-medium rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 active:scale-95 transition-all duration-200 flex items-center gap-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Remove</span>
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-500 text-center sm:text-left">
                JPG, PNG or WEBP. Max size 5MB.
              </p>
              {errors.avatar && (
                <p className="text-xs text-rose-400">{errors.avatar}</p>
              )}
            </div>
          </div>

          {/* 4. Form Fields & Labels */}
          <div className="space-y-4">

            {/* Field 1: Full Name * */}
            <div>
              <label htmlFor="fullName" className="block text-xs sm:text-sm font-semibold text-slate-300 mb-1.5">
                Full Name <span className="text-blue-400">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-400 transition-colors">
                  {/* User Icon */}
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: null }));
                  }}
                  placeholder="Enter your full name"
                  className="w-full bg-slate-900/80 border border-slate-700/70 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white text-sm placeholder-slate-500 rounded-xl pl-11 pr-4 py-2.5 sm:py-3 outline-none transition-all duration-200"
                />
              </div>
              {errors.fullName && (
                <p className="mt-1 text-xs text-rose-400">{errors.fullName}</p>
              )}
            </div>

            {/* Field 2: Username * */}
            <div>
              <label htmlFor="username" className="block text-xs sm:text-sm font-semibold text-slate-300 mb-1.5">
                Username <span className="text-blue-400">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-400 transition-colors">
                  {/* "@" Icon */}
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errors.username) setErrors((prev) => ({ ...prev, username: null }));
                  }}
                  placeholder="username"
                  className="w-full bg-slate-900/80 border border-slate-700/70 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white text-sm placeholder-slate-500 rounded-xl pl-11 pr-10 py-2.5 sm:py-3 outline-none transition-all duration-200"
                />
                {/* Green checkmark icon inside on right */}
                {username.trim().length >= 3 && !errors.username && (
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-emerald-400 animate-fadeIn">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              {/* Green helper text underneath */}
              <div className="mt-1.5 flex items-center gap-1.5">
                <span className="text-xs font-medium text-emerald-400">
                  ✓ এই ইউজারনেম ব্যবহারযোগ্য
                </span>
              </div>
              {errors.username && (
                <p className="mt-1 text-xs text-rose-400">{errors.username}</p>
              )}
            </div>

            {/* Field 3: Phone Number (Optional) */}
            <div>
              <label htmlFor="phone" className="block text-xs sm:text-sm font-semibold text-slate-300 mb-1.5">
                Phone Number <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-400 transition-colors">
                  {/* Phone Icon */}
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+8801342697743"
                  className="w-full bg-slate-900/80 border border-slate-700/70 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white text-sm placeholder-slate-500 rounded-xl pl-11 pr-4 py-2.5 sm:py-3 outline-none transition-all duration-200"
                />
              </div>
            </div>

          </div>

          {/* 6. Action Buttons at Bottom */}
          <div className="pt-4 mt-6 border-t border-slate-800/80 flex items-center justify-end gap-3">
            {/* Left/Secondary: Cancel / বাতিল Button (Outlined/Ghost) */}
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800/80 active:scale-95 transition-all duration-200 font-medium text-sm flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-slate-600"
            >
              <span>Cancel / বাতিল</span>
            </button>

            {/* Right/Primary: Save Changes / সংরক্ষণ করুন Button (Glowing Gradient: Blue to Purple) */}
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-[0_0_20px_rgba(79,70,229,0.35)] hover:shadow-[0_0_25px_rgba(79,70,229,0.55)] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Save Changes / সংরক্ষণ করুন</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
