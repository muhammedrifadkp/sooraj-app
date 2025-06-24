import React from 'react';
import AuthLayout from '../components/auth/AuthLayout';
import LoginForm from '../components/auth/LoginForm';

const AdminLogin = () => {
  return (
    <AuthLayout
      title="Administrator Login"
      subtitle="Sign in to access the admin dashboard"
    >
      <LoginForm isAdmin={true} />
    </AuthLayout>
  );
};

export default AdminLogin;