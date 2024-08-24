"use client"
import React from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';

const schema = yup.object().shape({
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address'),
});

const ForgotPassword = () => {
  const { register, handleSubmit, formState: { errors }, reset} = useForm({
    resolver: yupResolver(schema),
    mode: 'onBlur',
  });

  const submitForm = async (data) => {
  
    try {
      await axios.post('http://localhost:3001/forgetPassword', data);
      toast.success('Link for resetting your password has been sent to your email.',{
        icon: '📧',
        duration: 10000,
        style: {
          borderRadius: '10px',
          background: '#fff',
          color: '#333',
          boxShadow: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)'
        },
      });
      reset();
    } catch (error) {
      toast.error('An error occurred.',{
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
          <h2 className="text-2xl font-bold mb-6 text-blue-800">Request Password Reset</h2>
          <form onSubmit={handleSubmit(submitForm)} autoComplete='off'>
            <div className="mb-4">
              <label className="block text-gray-600 text-sm font-bold mb-2" htmlFor="email">
                E-mail
              </label>
              <input
                type="email"
                {...register('email')}
                placeholder="Email"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white"
              />
              {errors.email && <p className="text-red-500 text-xs italic">{errors.email.message}</p>}
            </div>
            <div className="flex items-center justify-center mt-10">
              <button className="border-2 rounded-full px-12 py-2 inline-block font-semibold border-blue-800 text-blue-800 hover:bg-blue-800 hover:text-white" type="submit">
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;