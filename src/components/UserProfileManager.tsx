import React, { useState } from 'react';
import { useCurrentUser, useUpdateUser, useChangePassword } from '@/api/hooks';
import { UserModel } from '@/auth';
import { enqueueSnackbar } from 'notistack';
import axios, { AxiosError } from 'axios';
import { ResponseModel } from '@/api';
import { useIntl } from 'react-intl';

export const UserProfileManager: React.FC = () => {
  const intl = useIntl();
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const updateUser = useUpdateUser();
  const changePassword = useChangePassword();

  // Form state
  const [profile, setProfile] = useState<Partial<UserModel>>({});
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Handle profile form changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle password form changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit profile update
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await updateUser.mutateAsync(profile);
      enqueueSnackbar(res.message, {
        variant: 'success'
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ResponseModel<never>>;
        enqueueSnackbar(
          axiosError.response?.data.message || intl.formatMessage({ id: 'COMMON.ERROR' }),
          { variant: 'error' }
        );
      } else {
        enqueueSnackbar(intl.formatMessage({ id: 'COMMON.ERROR' }), {
          variant: 'error'
        });
      }
    }
  };

  // Submit password change
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }

    try {
      await changePassword.mutateAsync(passwords);
      alert('Password changed successfully!');
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Failed to change password:', error);
      alert('Failed to change password.');
    }
  };

  if (userLoading) {
    return <div>Loading user data...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Profile Update Form */}
      <div className="p-6 bg-white rounded shadow">
        <h2 className="text-xl font-bold mb-4">Update Profile</h2>
        <form onSubmit={handleProfileSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={profile.name || user?.name || ''}
              onChange={handleProfileChange}
              className="w-full p-2 border rounded"
              placeholder="Your name"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={profile.email || user?.email || ''}
              onChange={handleProfileChange}
              className="w-full p-2 border rounded"
              placeholder="Your email"
            />
          </div>

          <button
            type="submit"
            disabled={updateUser.isPending}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {updateUser.isPending ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>

      {/* Change Password Form */}
      <div className="p-6 bg-white rounded shadow">
        <h2 className="text-xl font-bold mb-4">Change Password</h2>
        <form onSubmit={handlePasswordSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={passwords.currentPassword}
              onChange={handlePasswordChange}
              className="w-full p-2 border rounded"
              placeholder="Current password"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">New Password</label>
            <input
              type="password"
              name="newPassword"
              value={passwords.newPassword}
              onChange={handlePasswordChange}
              className="w-full p-2 border rounded"
              placeholder="New password"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={passwords.confirmPassword}
              onChange={handlePasswordChange}
              className="w-full p-2 border rounded"
              placeholder="Confirm new password"
            />
          </div>

          <button
            type="submit"
            disabled={changePassword.isPending}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            {changePassword.isPending ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
};
