"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { Toaster, toast } from 'react-hot-toast';
import Link from 'next/link';
import { IoChevronBack } from "react-icons/io5";
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';


const schema = yup.object().shape({
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
});

function ResetPassword() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [token, setToken] = useState('');
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: yupResolver(schema),
        mode: 'onBlur',
});

  // Extract the token from the URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setToken(urlParams.get('token'));
  }, []);

  const handleResetPassword = async (data) => {
    try {
      const response = await axios.put('http://localhost:3001/resetPassword', { newPassword: data.password }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      toast.success(response.data.message, {
        duration: 10000,
      });
      reset();
    } catch (error) {
      toast.error('Error resetting password', {
        duration: 10000,
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <Toaster />
      <div className="relative">
        <div className="bg-white rounded-lg shadow-lg p-24">
            <div className="absolute top-5 left-5 text-left font-bold">
                <span className="text-blue-800">Task</span>Management
            </div>
          <h2 className="text-2xl font-bold mb-6 text-blue-800">Reset Password</h2>
          <form onSubmit={handleSubmit(handleResetPassword)} autoComplete='off'>
            <div className="relative mb-4">
            <label className="block text-gray-600 text-sm font-bold mb-2" htmlFor="password">
                New Password
            </label>
            <div className="relative">
                <input
                type={showPassword ? "text" : "password"}
                {...register('password')}
                placeholder="New Password"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white pr-10"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                {showPassword ? (
                    <MdVisibility
                    className="text-gray-400 cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                    />
                ) : (
                    <MdVisibilityOff
                    className="text-gray-400 cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                    />
                )}
                </div>
            </div>
            {errors.password && <p className="text-blue-400 text-xs italic">{errors.password.message}</p>}
            </div>
            <div className="relative mb-4">
                <label className="block text-gray-600 text-sm font-bold mb-2" htmlFor="confirmPassword">
                    Confirm Password
                </label>
                <div className="relative">
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        {...register('confirmPassword')}
                        placeholder="Confirm Password"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white pr-10"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        {showConfirmPassword ? (
                            <MdVisibility
                            className="text-gray-400 cursor-pointer"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            />
                        ) : (
                            <MdVisibilityOff
                            className="text-gray-400 cursor-pointer"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        />
                    )}
                </div>
            </div>
            {errors.confirmPassword && <p className="text-blue-400 text-xs italic">{errors.confirmPassword.message}</p>}
            </div>
            <div className="flex items-center justify-center mt-10">
              <button className="border-2 rounded-full px-12 py-2 inline-block font-semibold border-blue-800 text-blue-800 hover:bg-blue-800 hover:text-white" type="submit">
                Submit
              </button>
            </div>
          </form>
          <div className="absolute bottom-0 left-0 mb-4 ml-4">
          <Link href="/" className="text-blue-700 hover:underline flex items-center">
            <IoChevronBack />
            Back to Login
          </Link>
        </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;