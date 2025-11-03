import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  UserCircleIcon, 
  PencilSquareIcon, 
  KeyIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserIcon,
  TruckIcon,
  ShieldCheckIcon,
  BriefcaseIcon,
  CameraIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import toast from '../../../utils/toast';
import { 
  useGetMyProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useUploadAvatarMutation,
} from '../../../services/user.service';
import { logoutAction } from '../../../store/slices/auth.slice';
import { PATHS } from '../../../constant/path/pathname';

const ROLE_CONFIG = {
  admin: {
    title: 'Hồ sơ Quản trị viên',
    icon: ShieldCheckIcon,
    color: 'blue',
    gradient: 'from-blue-600 to-blue-400',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    sections: [
      { key: 'personal', label: 'Thông tin cá nhân', icon: UserIcon },
      { key: 'security', label: 'Bảo mật', icon: KeyIcon },
    ]
  },
  staff: {
    title: 'Hồ sơ Nhân viên',
    icon: BriefcaseIcon,
    color: 'emerald',
    gradient: 'from-emerald-600 to-emerald-400',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200',
    sections: [
      { key: 'personal', label: 'Thông tin cá nhân', icon: UserIcon },
      { key: 'security', label: 'Bảo mật', icon: KeyIcon },
    ]
  },
  driver: {
    title: 'Hồ sơ Tài xế',
    icon: TruckIcon,
    color: 'indigo',
    gradient: 'from-indigo-600 to-indigo-400',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    borderColor: 'border-indigo-200',
    sections: [
      { key: 'personal', label: 'Thông tin cá nhân', icon: UserIcon },
      { key: 'security', label: 'Bảo mật', icon: KeyIcon },
    ]
  }
};

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { role, user: authUser } = useSelector((state) => state.auth);
  
  // ✅ All API hooks from user service
  const { 
    data: profileData, 
    isLoading: isLoadingProfile, 
    error: profileError,
    refetch 
  } = useGetMyProfileQuery(undefined, {
    onError: (error) => {
      console.error('Profile fetch error:', error);
      if (error?.status === 401 || error?.data?.code === '401') {
        toast.error('Phiên đăng nhập đã hết hạn');
        dispatch(logoutAction());
        navigate(PATHS.AUTH.LOGIN);
      }
    }
  });
  
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();
  const [uploadFile, { isLoading: isUploadingFile }] = uploadToCloudinary();

  // ✅ State management
  const [activeSection, setActiveSection] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    avatarUrl: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // ✅ Avatar upload states
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const fileInputRef = useRef(null);

  // ✅ User data with fallback
  const user = profileData?.content || authUser;
  const currentRole = user?.role?.toLowerCase() || role;
  const usingFallbackData = profileError && user && Object.keys(user).length > 0;

  // ✅ Initialize form data
  useEffect(() => {
    if (user) {
      setEditForm({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || user.phoneNumber || '',
        avatarUrl: user.avatarUrl || '',
      });
      setAvatarPreview(user.avatarUrl || '');
    }
  }, [user]);

  // Get role config
  const config = ROLE_CONFIG[currentRole] || ROLE_CONFIG.driver;
  const RoleIcon = config.icon;

  // ✅ Handle avatar file selection
  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh hợp lệ');
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('File ảnh không được vượt quá 5MB');
      return;
    }

    // Set file and show local preview
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  // ✅ Upload avatar using unified service
  const uploadAvatar = async () => {
    if (!avatarFile) return editForm.avatarUrl || '';

    try {
      const formData = new FormData();
      formData.append('file', avatarFile);

      const uploadResult = await uploadFile(formData).unwrap();
      
      // Extract URL from different possible response formats
      const avatarUrl = uploadResult?.content?.url || 
                       uploadResult?.content?.secure_url || 
                       uploadResult?.url || 
                       uploadResult?.secure_url ||
                       uploadResult?.data?.url;
      
      if (!avatarUrl) {
        throw new Error('Không nhận được URL ảnh từ server');
      }
      
      // Update preview and form
      setAvatarPreview(avatarUrl);
      setEditForm(prev => ({ ...prev, avatarUrl }));
      
      return avatarUrl;
    } catch (err) {
      console.error('Upload avatar error:', err);
      const errorMessage = err?.data?.message || err?.message || 'Tải ảnh lên thất bại';
      toast.error(errorMessage);
      throw err;
    }
  };

  // ✅ Remove avatar
  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview('');
    setEditForm(prev => ({ ...prev, avatarUrl: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Form handlers
  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  // ✅ Save profile with avatar upload
  const handleSaveProfile = async () => {
    try {
      // Validate required fields
      if (!editForm.fullName.trim()) {
        toast.error('Vui lòng nhập họ và tên');
        return;
      }
      if (!editForm.email.trim()) {
        toast.error('Vui lòng nhập email');
        return;
      }

      let finalAvatarUrl = editForm.avatarUrl || '';

      // Upload avatar first if there's a new file
      if (avatarFile) {
        const uploadToast = toast.loading('Đang tải ảnh lên...');
        try {
          finalAvatarUrl = await uploadAvatar();
          toast.dismiss(uploadToast);
          toast.success('Tải ảnh lên thành công');
        } catch (uploadErr) {
          toast.dismiss(uploadToast);
          return; // Stop if upload fails
        }
      }

      // Prepare payload for API
      const payload = {
        fullName: editForm.fullName.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone.trim(),
        avatarUrl: finalAvatarUrl,
      };

      // Update profile
      await updateProfile(payload).unwrap();
      
      toast.success('✅ Cập nhật thông tin thành công!');
      setIsEditing(false);
      setAvatarFile(null);
      refetch(); // Refresh profile data
    } catch (error) {
      console.error('Update profile failed:', error);
      const errorMessage = error?.data?.message || error?.message || 'Cập nhật thất bại';
      toast.error('❌ ' + errorMessage);
    }
  };

  // ✅ Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('❌ Mật khẩu xác nhận không khớp');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('❌ Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      }).unwrap();
      
      toast.success('✅ Đổi mật khẩu thành công!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Change password failed:', error);
      const errorMessage = error?.data?.message || error?.message || 'Đổi mật khẩu thất bại';
      toast.error('❌ ' + errorMessage);
    }
  };

  // ✅ Loading state
  if (isLoadingProfile) {
    return (
      <div className="px-6 py-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải thông tin người dùng...</p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Error handling
  const showApiWarning = profileError && (!user || Object.keys(user).length === 0);

  if (showApiWarning) {
    return (
      <div className="px-6 py-8 max-w-6xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center mb-6">
          <ExclamationTriangleIcon className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <p className="text-yellow-800 mb-4 font-medium">
            ⚠️ Không thể tải thông tin người dùng từ server
          </p>
          <p className="text-yellow-700 mb-4 text-sm">
            Lỗi: {profileError?.data?.message || profileError?.message || 'Lỗi không xác định'}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => refetch()}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition text-sm"
            >
              Thử lại
            </button>
            <button
              onClick={() => {
                dispatch(logoutAction());
                navigate(PATHS.AUTH.LOGIN);
              }}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm"
            >
              Đăng nhập lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Personal info section
  const renderPersonalSection = () => (
    <div className="space-y-6">
      {/* Warning banner for fallback data */}
      {usingFallbackData && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-orange-600" />
            <p className="text-orange-800 text-sm">
              Đang hiển thị thông tin từ phiên đăng nhập. Một số tính năng có thể bị hạn chế.
            </p>
            <button
              onClick={() => refetch()}
              className="text-orange-600 hover:underline text-sm ml-auto"
            >
              Thử lại
            </button>
          </div>
        </div>
      )}

      {/* Section header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Thông tin cá nhân</h3>
        <button
          onClick={() => setIsEditing(!isEditing)}
          disabled={isUpdating || isUploadingFile || usingFallbackData}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
            isEditing 
              ? 'bg-gray-100 text-gray-700 border-gray-300' 
              : `${config.bgColor} ${config.textColor} ${config.borderColor}`
          } ${(isUpdating || isUploadingFile || usingFallbackData) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <PencilSquareIcon className="w-4 h-4" />
          {isUpdating ? 'Đang cập nhật...' : 
           isUploadingFile ? 'Đang tải ảnh...' : 
           (isEditing ? 'Hủy' : 'Chỉnh sửa')}
        </button>
      </div>

      <div className="grid gap-6">
        {/* Avatar section */}
        <div className="flex items-center gap-6">
          <div className={`relative w-20 h-20 rounded-full ${config.bgColor} flex items-center justify-center overflow-hidden group`}>
            {avatarPreview ? (
              <img 
                src={avatarPreview} 
                alt="Avatar" 
                className="w-full h-full object-cover"
                onError={() => {
                  setAvatarPreview('');
                  setEditForm(prev => ({ ...prev, avatarUrl: '' }));
                }}
              />
            ) : (
              <UserCircleIcon className={`w-12 h-12 ${config.textColor}`} />
            )}
            
            {/* Upload overlay when editing */}
            {isEditing && !usingFallbackData && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                {isUploadingFile ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-white hover:scale-110 transition"
                    type="button"
                  >
                    <CameraIcon className="w-6 h-6" />
                  </button>
                )}
              </div>
            )}
            
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarSelect}
              className="hidden"
            />
          </div>
          
          {/* User info */}
          <div className="flex-1">
            <h4 className="text-xl font-semibold text-gray-900">{user?.fullName}</h4>
            <p className="text-gray-600 capitalize">{user?.role}</p>
            <p className="text-sm text-gray-500">ID: {user?.userId}</p>
            {user?.createdAt && (
              <p className="text-xs text-gray-400">
                Tham gia: {new Date(user.createdAt).toLocaleDateString('vi-VN')}
              </p>
            )}
            
            {/* Avatar controls when editing */}
            {isEditing && !usingFallbackData && (
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingFile}
                  className={`text-xs px-3 py-1 rounded-lg border ${config.borderColor} ${config.textColor} hover:bg-gray-50 transition disabled:opacity-50`}
                >
                  {avatarPreview ? 'Thay đổi' : 'Thêm ảnh'}
                </button>
                {avatarPreview && (
                  <button
                    onClick={handleRemoveAvatar}
                    disabled={isUploadingFile}
                    className="text-xs px-3 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                  >
                    Xóa
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Form fields */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Họ và tên *
            </label>
            {isEditing && !usingFallbackData ? (
              <input
                type="text"
                name="fullName"
                value={editForm.fullName}
                onChange={handleEditChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            ) : (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <UserIcon className="w-5 h-5 text-gray-400" />
                <span>{user?.fullName}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            {isEditing && !usingFallbackData ? (
              <input
                type="email"
                name="email"
                value={editForm.email}
                onChange={handleEditChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            ) : (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                <span>{user?.email}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số điện thoại
            </label>
            {isEditing && !usingFallbackData ? (
              <input
                type="tel"
                name="phone"
                value={editForm.phone}
                onChange={handleEditChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <PhoneIcon className="w-5 h-5 text-gray-400" />
                <span>{user?.phone || user?.phoneNumber || 'Chưa cập nhật'}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái
            </label>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <div className={`w-3 h-3 rounded-full ${
                user?.status === 'Active' ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className={user?.status === 'Active' ? 'text-green-700' : 'text-red-700'}>
                {user?.status === 'Active' ? 'Hoạt động' : (user?.status || 'Không xác định')}
              </span>
            </div>
          </div>
        </div>

        {/* Save/Cancel buttons */}
        {isEditing && !usingFallbackData && (
          <div className="flex gap-3">
            <button
              onClick={handleSaveProfile}
              disabled={isUpdating || isUploadingFile}
              className={`px-6 py-2 bg-gradient-to-r ${config.gradient} text-white rounded-lg hover:opacity-90 transition ${
                (isUpdating || isUploadingFile) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isUpdating ? 'Đang lưu...' : isUploadingFile ? 'Đang tải ảnh...' : 'Lưu thay đổi'}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                // Reset form
                setEditForm({
                  fullName: user?.fullName || '',
                  email: user?.email || '',
                  phone: user?.phone || user?.phoneNumber || '',
                  avatarUrl: user?.avatarUrl || '',
                });
                setAvatarPreview(user?.avatarUrl || '');
                setAvatarFile(null);
              }}
              disabled={isUpdating || isUploadingFile}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Hủy
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // ✅ Security section  
  const renderSecuritySection = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Bảo mật tài khoản</h3>
      
      {usingFallbackData && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
          <p className="text-orange-800 text-sm">
            ⚠️ Đổi mật khẩu bị vô hiệu hóa khi không thể kết nối server.
          </p>
        </div>
      )}
      
      <div className={`p-6 ${config.bgColor} rounded-xl ${config.borderColor} border ${usingFallbackData ? 'opacity-50' : ''}`}>
        <h4 className="font-semibold text-gray-900 mb-4">Đổi mật khẩu</h4>
        
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu hiện tại
            </label>
            <input
              type="password"
              name="currentPassword"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              disabled={usingFallbackData}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu mới
            </label>
            <input
              type="password"
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              disabled={usingFallbackData}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              minLength={6}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Xác nhận mật khẩu mới
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              disabled={usingFallbackData}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isChangingPassword || usingFallbackData}
            className={`px-6 py-2 bg-gradient-to-r ${config.gradient} text-white rounded-lg hover:opacity-90 transition ${
              (isChangingPassword || usingFallbackData) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isChangingPassword ? 'Đang đổi...' : 'Đổi mật khẩu'}
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className={`relative overflow-hidden bg-gradient-to-r ${config.gradient} rounded-2xl p-8 mb-8 text-white`}>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <RoleIcon className="w-10 h-10" />
            <h1 className="text-3xl font-bold">{config.title}</h1>
          </div>
          <p className="text-white/90">
            Quản lý thông tin cá nhân và cài đặt tài khoản
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 translate-x-24" />
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <nav className="space-y-2">
              {config.sections.map((section) => {
                const SectionIcon = section.icon;
                return (
                  <button
                    key={section.key}
                    onClick={() => setActiveSection(section.key)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${
                      activeSection === section.key
                        ? `${config.bgColor} ${config.textColor} font-medium`
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <SectionIcon className="w-5 h-5" />
                    {section.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {activeSection === 'personal' && renderPersonalSection()}
            {activeSection === 'security' && renderSecuritySection()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;