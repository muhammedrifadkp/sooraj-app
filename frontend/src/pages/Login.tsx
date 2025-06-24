import React from 'react';
import AuthLayout from '../components/Auth/AuthLayout';
import LoginForm from '../components/Auth/LoginForm';

const Login = () => {
  return (
    <AuthLayout
      title="Student Login"
      subtitle="Sign in to access your courses and assignments"
    >
      <LoginForm isAdmin={false} />
    </AuthLayout>
  );
};

export default Login;