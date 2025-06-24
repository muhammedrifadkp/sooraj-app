import React from 'react';
import AuthLayout from '../components/Auth/AuthLayout';
import RegisterForm from '../components/Auth/RegisterForm';

const SignUp = () => {
  return (
    <AuthLayout
      title="Create Student Account"
      subtitle="Join our learning platform to access courses and resources"
    >
      <RegisterForm />
    </AuthLayout>
  );
};

export default SignUp;