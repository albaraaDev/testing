import React from 'react';
import { useCurrentUser } from '@/auth';

export const UserProfileData: React.FC = () => {
  // Use the React Query hook
  const { data: user, isLoading, isError, error, refetch } = useCurrentUser();

  if (isLoading) {
    return <div>Loading user data...</div>;
  }

  if (isError) {
    return <div>Error loading user data: {error?.message}</div>;
  }

  if (!user) {
    return (
      <div>
        No user data available. <button onClick={() => refetch()}>Retry</button>
      </div>
    );
  }

  return (
    <div>
      <h2>User Profile</h2>
      <p>Name: {user.name}</p>
      <p>Username: {user.username}</p>
      {/* Display other user properties as needed */}
      <button onClick={() => refetch()}>Refresh Data</button>
    </div>
  );
};
