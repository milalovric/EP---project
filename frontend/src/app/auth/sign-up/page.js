"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaRegEnvelope } from 'react-icons/fa';
import { MdLockOutline, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { AiOutlineUser } from 'react-icons/ai';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

const schema = yup.object().shape({
    username: yup.string()
        .required('Please enter a username'),
    email: yup.string()
        .email('Please enter a valid email address')
        .required('Email is required'),
    password: yup
        .string()
        .min(8, 'Password must be at least 8 characters long')
        .required('Password is required'),
    confirmPassword: yup.string()
        .oneOf([yup.ref('password'), null], 'Passwords must match')
});

const SignUp = () => {
    const router = useRouter();
    const { register, handleSubmit, formState: { errors, dirtyFields, isValid } } = useForm({
        resolver: yupResolver(schema),
        mode: 'onBlur'
    });

    useEffect(() => {
        console.log('isValid', isValid);
    }, [isValid]);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => {
            setErrorMessage('');
        }, 3000);

        return () => clearTimeout(timer);
    }, [errorMessage]);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const submitForm = async (data) => {
        if (isSubmitting) {
            return;
        }
        
        console.log(data);
        setIsSubmitting(true);
        try {
            const response = await axios.post('http://localhost:3001/api/users', data);
            console.log(response.data);
            toast.success ('Uspješno ste se registrirali!', {
                autoClose: 3000,
            });
            setTimeout(() => {
                router.push('/');
            }, 1000);
        } catch (error) {
            console.error("signup error", error.response.data);
            if ( error.response.data.message === "User with this email already exists") {
                setErrorMessage('User with this email already exists!');
            } else if (error.response.status === 400 && error.response.data.message === "User with this username already exists") {
                setErrorMessage('User with this username already exists!');
            } else {
                setErrorMessage('Error occurred while registering. Please try again later.');
            }
        }
        setIsSubmitting(false);
    };

    return (
        <div className="flex flex-col justify-center items-center min-h-screen py-2 bg-gray-100">
            <Toaster />
            <main className="w-full flex flex-col items-center justify-center flex-1 px-5 lg:px-20">
                <div className="bg-white rounded-2xl shadow-2xl w-full lg:w-2/3 max-w-lg">
                    <div className="w-full lg:w-3/5 p-5 mx-auto">
                        <div className="text-left font-bold">
                            <span className="text-blue-800">Task</span>Management
                        </div>
                        <div className="py-10">
                            <h2 className="text-2xl font-bold text-center text-blue-800">Create an Account</h2>
                            <div className="border-2 w-10 border-blue-800 mx-auto mb-2"></div>

                            <form onSubmit={handleSubmit(submitForm)} className="flex flex-col items-center">

                                <div className={`w-full lg:w-72 p-2 flex flex-col items-start relative mb-2`}>
                                    <div className="flex items-center w-full relative">
                                    <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400">
                                        <AiOutlineUser />
                                        </div>
                                        <input
                                        type="text" 
                                        name="username" 
                                        placeholder="Username" 
                                        className="shadow appearance-none border-2 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white pl-7" {...register("username")} 
                                    onKeyPress={(event) => {
                                        if (event.key === 'Enter') {
                                            handleSubmit(submitForm)();
                                        }
                                    }}/>

                                </div>
                                </div>
                                <p className='error-message'>{dirtyFields.username && errors.username?.message}</p>

                                <div className={`w-full lg:w-72 p-2 flex flex-col items-start relative mb-2`}>
                                    <div className="flex items-center w-full relative">
                                    <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400">
                                        <FaRegEnvelope />
                                        </div>
                                        <input 
                                        type="email" 
                                        name="email" 
                                        placeholder="Email" 
                                        className="shadow appearance-none border-2 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white pl-7" {...register("email")} 
                                        onKeyPress={(event) => {
                                            if (event.key === 'Enter') {
                                                handleSubmit(submitForm)();
                                            }
                                        }}
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
                                        onKeyPress={(event) => {
                                            if (event.key === 'Enter') {
                                            handleSubmit(submitForm)();
                                            }
                                        }}
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

                                <div className={`w-full lg:w-72 p-2 flex flex-col items-start relative mb-3`}>
                                    <div className="flex items-center w-full relative">
                                        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400">
                                        <MdLockOutline />
                                        </div>
                                        <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        placeholder="Confirm Password"
                                        className="shadow appearance-none border-2 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white pl-7 "
                                        {...register("confirmPassword")}
                                        onKeyPress={(event) => {
                                            if (event.key === 'Enter') {
                                                handleSubmit(submitForm)();
                                            }
                                        }}
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                        {showConfirmPassword ? (
                                            <MdVisibility
                                                className="text-gray-400 cursor-pointer"
                                                onClick={toggleConfirmPasswordVisibility}
                                            />
                                        ) : (
                                            <MdVisibilityOff
                                                className="text-gray-400 cursor-pointer"
                                                onClick={toggleConfirmPasswordVisibility}
                                            />
                                        )}
                                    </div>
                                </div>
                                <p className="text-blue-400 text-xs italic">{dirtyFields.confirmPassword && errors.confirmPassword?.message}</p>
                                </div>
                                {errorMessage && <p className="text-red-500">{errorMessage}</p>}

                                <button type= "submit" className={`border-2 rounded-full px-12 py-2 inline-block font-semibold ${isSubmitting ? 'bg-blue-800 text-white' : 'border-blue-800 text-blue-800 hover:bg-blue-800 hover:text-white'}`} >Sign Up </button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default SignUp;
