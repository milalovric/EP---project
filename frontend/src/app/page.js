"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaRegEnvelope } from 'react-icons/fa';
import { MdLockOutline, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import Link from 'next/link';
import { toast, Toaster } from 'react-hot-toast';


const schema = yup.object().shape({
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters long')
});

const Home = () => {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, dirtyFields, isValid } } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

  useEffect(() => {
    console.log('isValid', isValid);
  }, [isValid]);

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);


  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const submitForm = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post('http://localhost:3001/login', data);
      console.log(response.data); 
  
      const { id, role, username, token } = response.data;
  
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('username', username);
      localStorage.setItem('userId', id); 
  
      if (role === 'admin') {
        router.push('/admin/task');
      } else {
        router.push('/home/task');
      }
      
      toast.success('Successfully logged in!');
    } catch (error) {
      console.error("login error", error); 
  
      if (error.response && error.response.status === 404) {
        
        toast.error('User with this email doesn\'t exist.');
      } else if (error.response && error.response.status === 401) {
        toast.error('Incorrect password.');
      } else {
        toast.error('An error occurred.');
      }
    }
    setIsSubmitting(false);
  };
  


  const goToSignUp = () => {
    router.push('/auth/sign-up');
  };

  return (
    <div className="flex flex-col justify-center min-h-screen py-2 bg-gray-100">
      <Toaster />
      <main className="flex flex-col items-center justify-center w-full flex-1 px-5 lg:px-20 min-h-screen bg-gray-100 text-center">
        <div className="bg-white rounded-2xl shadow-2xl flex flex-col lg:flex-row w-full lg:w-2/3 max-w-4xl">
          <div className="w-full lg:w-3/5 p-5">
            <div className="text-left font-bold">
              <span className="text-blue-800">Task</span>Management
            </div>
            <div className="py-24">
              <h2 className="text-3xl font-bold text-blue-800">Sign in to Account</h2>
              <div className="border-2 w-10 border-blue-800 inline-block mb-2"></div>

              <form onSubmit={handleSubmit(submitForm)} className="flex flex-col items-center" autoComplete='off'>
                <div className={`w-full lg:w-72 p-2 flex flex-col items-start relative mb-2`}>
                  <div className="flex items-center w-full relative">
                  <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <FaRegEnvelope />
                    </div>
                    <input 
                      type="email" 
                      name="email" 
                      placeholder="Email" 
                      className="shadow appearance-none border-2 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white pl-7" 
                      {...register("email")} 
                    />
                    </div>
                  {dirtyFields.email && <p className="text-blue-400 text-xs italic">{errors.email?.message}</p>}
                </div>

                <div className={`w-full lg:w-72 p-2 flex flex-col items-start relative mb-3`}>
                  <div className="flex items-center w-full relative">
                    <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <MdLockOutline />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Password"
                      className="shadow appearance-none border-2 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white pl-7"
                      {...register("password")}
                      
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      {showPassword ? (
                        <MdVisibility
                          className="text-gray-400 cursor-pointer"
                          onClick={togglePasswordVisibility}
                        />
                      ) : (
                        <MdVisibilityOff
                          className="text-gray-400 cursor-pointer"
                          onClick={togglePasswordVisibility}/>
                      )}
                    </div>
                  </div>
                  {dirtyFields.password && <p className="text-blue-400 text-xs italic">{errors.password?.message}</p>}
                </div>
                
                <div className="flex justify-between w-full lg:w-64 mb-5 ">
                  <label className="flex items-center text-xs">
                      <input type="checkbox" name="remember" className="mr-1"/>
                      Remember me
                  </label>
                  <Link href="/auth/forgotPassword">
                    <p className="text-xs text-blue-500">Forgot Password?</p>
                  </Link>
                </div>
                {errorMessage && <p className='error-message'>{errorMessage}</p>} 
                <button className={`border-2 rounded-full px-12 py-2 inline-block font-semibold ${isSubmitting ? 'bg-blue-800 text-white' : 'border-blue-800 text-blue-800 hover:bg-blue-800 hover:text-white'}`} >Sign In </button>
              </form>
            </div>
          </div>

          <div className="w-full lg:w-2/5 bg-blue-800 text-white rounded-tr-2xl rounded-br-2xl py-10 lg:py-36 px-6 lg:px-12">
            <h2 className="text-3xl font-bold mb-2">Welcome to Task Management</h2>
            <div className="border-2 w-10 border-white inline-block mb-2"></div>
            <p className="mb-2">Sign up to start managing your tasks</p>
            <p className="mb-2 invisible">mmm</p>
            <button className="border-2 border-white rounded-full px-12 py-2 inline-block font-semibold hover:bg-white hover:text-blue-800" onClick={goToSignUp}>Sign Up</button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;