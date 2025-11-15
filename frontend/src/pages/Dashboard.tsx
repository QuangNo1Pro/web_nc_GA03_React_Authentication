
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuth } from '../auth/auth';

const fetchProfile = async () => {
  const { data } = await api.get('/auth/profile');
  return data;
};

export default function Dashboard() {
  const { logout } = useAuth();
  const { data, error, isLoading } = useQuery({ queryKey: ['profile'], queryFn: fetchProfile });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error occurred: {error.message}</div>;

  return (
    <div className="mt-8">
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Dashboard</h2>
        <p>Welcome, {data.email}</p>
        <button onClick={logout} className="mt-4 bg-red-500 text-white py-2 px-4 rounded">
          Logout
        </button>
      </div>
    </div>
  );
}
