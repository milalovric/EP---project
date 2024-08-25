"use client";
import React, { useState, useEffect } from 'react';
import Sidebar from '../sidebar';
import axios from 'axios';
import { HiOutlineUser } from "react-icons/hi2";
import { FiEdit3 } from "react-icons/fi";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { MdDeleteForever } from "react-icons/md";
import { MdErrorOutline } from "react-icons/md";

function Profile() {
    const [userInfo, setUserInfo] = useState(null);
    const [isEditing, setIsEditing] = useState({ username: false, email: false });
    const [editableUserInfo, setEditableUserInfo] = useState({ username: '', email: '' });
    const [refresh, setRefresh] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const maxLength = 20;
    const [hasChanges, setHasChanges] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [backendError, setBackendError] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const userId = localStorage.getItem('userId');
        if (userId) {
            fetchUserInfo(userId);
        }
    }, [refresh]);

    useEffect(() => {
        if (userInfo && editableUserInfo) {
            if (editableUserInfo.username !== userInfo.username || editableUserInfo.email !== userInfo.email || newPassword !== '') {
                setHasChanges(true);
            } else {
                setHasChanges(false);
            }
        }
    }, [editableUserInfo, userInfo, newPassword]);

    const fetchUserInfo = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:3001/api/users/${userId}`);
            setUserInfo(response.data);
            setEditableUserInfo(response.data);
            setIsEditing({ username: true, email: false });
        } catch (error) {
            console.error("Error fetching user information", error);
        }
    };

    const handleInputChange = (event, field) => {
        setEditableUserInfo({ ...editableUserInfo, [field]: event.target.value });
        setInputValue(event.target.value);
        setHasChanges(true);
    };

    const handleSaveChanges = async () => {
        try {
            const userId = localStorage.getItem('userId');
            let requestData = {
                username: editableUserInfo.username,
                email: editableUserInfo.email,
            };

            if (requestData.username.trim() === '') {
                setErrorMessage("Username cannot be empty!");
                setTimeout(() => {
                    setErrorMessage('');
                }, 3000);
                return;
            }
    
            if (currentPassword && newPassword) {
                if (newPassword !== confirmPassword) {
                    setErrorMessage("Confirm password does not match new password");
                    setTimeout(() => {
                        setErrorMessage('');
                    }, 3000);
                    return;
                }
                requestData = {
                    ...requestData,
                    currentPassword,
                    newPassword,
                };
    
                if (newPassword.length < 8) {
                    setErrorMessage("New password must be at least 8 characters long");
                    setTimeout(() => {
                        setErrorMessage('');
                    }, 3000);
                    return;
                }
            }
    
            const response = await axios.put(`http://localhost:3001/api/users/${userId}`, requestData);
            setUserInfo(response.data);
            setIsEditing(prevState => ({ ...prevState, username: false, email: false }));
            setRefresh(!refresh);
            setHasChanges(false);
    
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setSuccessMessage("User updated successfully");
            setTimeout(() => {
                setSuccessMessage('');
            }, 5000);
            setErrorMessage('');
            setBackendError('');
        } catch (error) {
            if (error.response && error.response.status === 400 && error.response.data.message) {
                setBackendError(error.response.data.message);
            } else {
                setBackendError("Error updating user information");
            }
            setTimeout(() => {
                setBackendError('');
            }, 5000);
            console.error("Error updating user information", error);
        }
    };

    const handleDeleteUser = async () => {
        setIsModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        setIsModalOpen(false);
        try {
            const userId = localStorage.getItem('userId');
            await axios.delete(`http://localhost:3001/api/users/${userId}`);
            localStorage.removeItem('userId');
            router.push('/');
        } catch (error) {
            console.error("Error deleting user", error);
        }
    };

    const handleCancelDelete = () => {
        setIsModalOpen(false);
    };

    return (
        <div className='max-w-none flex lg:flex-row lg:items-start lg:justify-start flex-grow'>
            <div className="lg:w-1/5">
                <Sidebar  />
            </div>
            <div className="p-4 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5 flex-grow mx-auto lg:mx-0 lg:ml-auto lg:mr-32 mt-14">
                {userInfo && (
                    <div>
                        <div className="px-4 sm:px-0">
                            <h3 className="text-base font-semibold leading-7 text-gray-900 flex justify-between items-center">
                                <div className="flex items-center">
                                <HiOutlineUser className="mr-2" size={22} /> Personal details
                                </div>
                                <MdDeleteForever className="cursor-pointer text-blue-800 text-3xl" onClick={handleDeleteUser} />
                            </h3>
                            <p className="mt-1 text-sm leading-6 text-gray-500">Update your personal information</p>
                        </div>
                        <div className="mt-6 border-t border-gray-100">
                            <dl className="divide-y divide-gray-100">
                                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                    <dt className="text-sm font-medium leading-6 text-gray-900 self-center">Full name</dt>
                                    <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0 flex items-center justify-between">
                                        {isEditing.username ? (
                                            <div className="relative flex">
                                                <input
                                                    type="text"
                                                    className='w-60 border-b border-gray-300 focus:outline-none focus:border-blue-500'
                                                    value={inputValue || editableUserInfo.username}
                                                    onChange={(e) => handleInputChange(e, 'username')}
                                                    maxLength={maxLength}
                                                />
                                                <p className="absolute right-0 bottom-0 text-right text-xs text-gray-500 w-60">{`${editableUserInfo.username.length}/${maxLength}`}</p>
                                            </div>
                                        ) : (
                                            <span className="self-center">{userInfo.username}</span>
                                        )}
                                        <FiEdit3 className="cursor-pointer text-gray-400 w-5 h-5 self-center" />
                                    </dd>
                                </div>
                                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                    <dt className="text-sm font-medium leading-6 text-gray-900">Email address</dt>
                                    <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{userInfo.email}</dd>
                                </div>
                                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0 relative">
                                    <dt className="text-sm font-medium leading-6 text-gray-900 self-center">Current Password</dt>
                                    <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                                        <div className="relative flex items-center">
                                            <input
                                                type={showCurrentPassword ? "text" : "password"}
                                                className='w-60 border-b border-gray-300 focus:outline-none focus:border-blue-500'
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                            />
                                            <span
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                className="cursor-pointer ml-2"
                                            >
                                                {showCurrentPassword ? <FaEye className="text-gray-400 w-5 h-5"/> : <FaEyeSlash className="text-gray-400 w-5 h-5" />}
                                            </span>
                                        </div>
                                    </dd>
                                </div>
                                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0 relative">
                                    <dt className="text-sm font-medium leading-6 text-gray-900">New Password</dt>
                                    <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                                        <div className="relative flex items-center">
                                            <input
                                                type={showNewPassword ? "text" : "password"}
                                                className='w-60 border-b border-gray-300 focus:outline-none focus:border-blue-500'
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                            />
                                            <span
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="cursor-pointer ml-2"
                                            >
                                                {showNewPassword ? <FaEye className="text-gray-400 w-5 h-5"/> : <FaEyeSlash className="text-gray-400 w-5 h-5"/>}
                                            </span>
                                        </div>
                                    </dd>
                                </div>
                                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0 relative">
                                    <dt className="text-sm font-medium leading-6 text-gray-900">Confirm Password</dt>
                                    <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                                        <div className="relative flex items-center">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                className='w-60 border-b border-gray-300 focus:outline-none focus:border-blue-500'
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                            />
                                            <span
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="cursor-pointer ml-2"
                                            >
                                                {showConfirmPassword ? <FaEye className="text-gray-400 w-5 h-5" /> : <FaEyeSlash className="text-gray-400 w-5 h-5"/>}
                                            </span>
                                        </div>
                                    </dd>
                                </div>
                            </dl>
                        </div>
                        {errorMessage && (
                            <div className="px-4 mt-4 text-red-600">{errorMessage}</div>
                        )}
                        {successMessage && (
                            <div className="px-4 mt-4 text-green-600">{successMessage}</div>
                        )}
                        {backendError && (
                            <div className="px-4 mt-4 text-red-600">{backendError}</div>
                        )}
                        <button
                            onClick={handleSaveChanges}
                            disabled={!hasChanges}
                            className={`flex items-center justify-center text-white font-semibold rounded-md py-2 px-20 ml-auto ${hasChanges ? 'bg-blue-700 hover:bg-blue-800' : 'bg-gray-400 cursor-not-allowed'}`}>
                            Save
                        </button>
                    </div>
                )}

                {isModalOpen && (
                <div className="fixed inset-0 p-4 flex flex-wrap justify-center items-center w-full h-full z-[1000] before:fixed before:inset-0 before:w-full before:h-full before:bg-[rgba(0,0,0,0.5)] overflow-auto font-[sans-serif]">
                    <div className="w-full max-w-md bg-white shadow-lg rounded-md p-6 relative">
                        <div className="my-8 text-center">
                            <MdErrorOutline className="text-6xl inline"/>
                            <h4 className="text-xl font-semibold mt-6">Your account will be deleted permanently!</h4>
                            <p className="text-sm text-gray-500 mt-4">Are you sure to proceed?</p>
                        </div>
                        <div className="text-right space-x-4">
                        </div>
                        <div className="flex max-sm:flex-col gap-4">
                            <button type="button"
                                className="px-6 py-2.5 rounded w-full text-sm font-semibold border-none outline-none bg-gray-200 hover:bg-gray-300"
                                onClick={handleCancelDelete}>I am not sure</button>
                            <button type="button"
                                className="px-6 py-2.5 rounded w-full text-white text-sm font-semibold border-none outline-none bg-blue-700 hover:bg-blue-600"
                                onClick={handleConfirmDelete}>Remove my account</button>
                        </div>
                    </div>
                </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
