import React from 'react';
import AuthLayout from '../components/Auth/AuthLayout';
import LoginForm from '../components/Auth/LoginForm';

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