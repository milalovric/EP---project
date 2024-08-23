"use client";
import React from 'react'
import Sidebar from '../sidebar';
import { useState } from 'react';
import { useEffect, useRef } from 'react';
import { FiEdit } from "react-icons/fi";
import { FaEye } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { IoMdAdd, IoMdClose } from "react-icons/io";

import axios from 'axios';


const Users = () => {
    
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(10);
    const [openDropdowns, setOpenDropdowns] = useState(Array(users.length).fill(false));
    const dropdownRefs = useRef([]);
    const [addSuccessMessage, setAddSuccessMessage] = useState('');
    // update
    const [updatedUser, setUpdatedUser] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [updateSuccessMessage, setUpdateSuccessMessage] = useState('');
    const [updateValidationMessage, setUpdateValidationMessage] = useState('');
    //read
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [currentPreviewedUser, setCurrentPreviewedUser] = useState(null);
    const [cameFromReadModal, setCameFromReadModal] = useState(false);
    //delete
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    
    const [searchQuery, setSearchQuery] = useState('');

    

    useEffect(() => {
        fetchUsers(); 
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
      }, [searchQuery]);
      const fetchUsers = async () => {
        try {
            const response = await axios.get(`http://localhost:3001/api/users?search=${searchQuery}`);
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };
    





    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
    

    
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const toggleDropdown = (index) => {
        setOpenDropdowns((prevState) => {
            const updatedDropdowns = [...prevState];
            updatedDropdowns[index] = !updatedDropdowns[index];
            return updatedDropdowns;
        });
    };

    const handleClickOutside = (event) => {
        dropdownRefs.current.forEach((ref, index) => {
            if (ref && !ref.contains(event.target)) {
                setOpenDropdowns((prevState) => {
                    const updatedDropdowns = [...prevState];
                    updatedDropdowns[index] = false;
                    return updatedDropdowns;
                });
            }
        });
    };
    

    
//  user add
const handleSubmit = async (event) => {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);

    const userData = {
        username: formData.get('username'),
        email: formData.get('email'),
        password: formData.get('password')
    };

    try {
        const existingUser = users.find(user => user.email === userData.email || user.username === userData.username);
        
        if (existingUser) {
            console.error('Error: A user with the same email or username already exists.');
            
            setUpdateValidationMessage('Failed to add user: A user with the same email or username already exists.');
            setTimeout(() => {
                setUpdateValidationMessage('');
            }, 3000);
            return;
        }
        if (userData.password.length < 8) {
            console.error('Error: Password must be at least 8 characters long.');
            
            setUpdateValidationMessage('Failed to add user: Password must be at least 8 characters long.');
            setTimeout(() => {
                setUpdateValidationMessage('');
            }, 3000);
            return;
        }

        const response = await axios.post('http://localhost:3001/api/users', userData);
        console.log('User added:', response.data);
        fetchUsers(); 
        setIsAddModalOpen(false); 
        setAddSuccessMessage('User created successfully!');
        setTimeout(() => {
            setAddSuccessMessage('');
        }, 5000);
    } catch (error) {
        console.error('Error adding user:', error);
    }
};


    const handleModalToggle = () => {
        setIsAddModalOpen(!isAddModalOpen);
    };



    //edit
    
    const handleEditClick = (user, cameFromRead = false) => {
        console.log("Edit button clicked, user:", user); 
        setCurrentUser(user); 
        setUpdatedUser(user); 
        setIsModalOpen(true); 
        setIsPreviewModalOpen(false);
        setCameFromReadModal(cameFromRead);
        
        
    };
    
    const handleInputChange = (event) => {
        
        console.log("Naziv svojstva:", event.target.name);
        console.log("Vrijednost svojstva:", event.target.value);
    
        
        console.log("Prije ažuriranja, updatedUser:", updatedUser);
    
       
        setUpdatedUser({
            ...updatedUser,
            [event.target.name]: event.target.value
        });
    
        
        console.log("Nakon ažuriranja, updatedUser:", updatedUser);
    };
    
    const handleUpdate = async () => {
        try {
            const existingUser = users.find(user => 
                (user.email === updatedUser.email || user.username === updatedUser.username) && user._id !== currentUser._id
            );
    
            if (existingUser) {
                console.error('Error: User with the same email or username already exists.');
               
                setUpdateValidationMessage('User with the same email or username already exists.');
                setTimeout(() => {
                    setUpdateValidationMessage('');
                }, 3000);
                return;
            }
        
            const response = await axios.put(`http://localhost:3001/api/users/${currentUser._id}`, updatedUser);
    
           
            fetchUsers();
    
            setIsModalOpen(false);
            setCurrentPreviewedUser(response.data);
            setUpdateSuccessMessage('User updated successfully!');
            setTimeout(() => {
                setUpdateSuccessMessage('');
            }, 5000);
            
            if (cameFromReadModal) {
                setIsPreviewModalOpen(true);
                setCameFromReadModal(false);
            }
        } catch (error) {
            console.error('Failed to update user:', error);
        }
    };
    

    
    //read

    const handlePreviewClick = (user) => {
        setCurrentPreviewedUser(user);
        setIsPreviewModalOpen(true);
        setIsModalOpen (false);
    };


    // delete 
    const handleDeleteClick = (id) => {
        setIsDeleteModalOpen(true);
        setUserToDelete(id);
    };

    const handleConfirmDelete = () => {
        if (userToDelete) {
            axios.delete(`http://localhost:3001/api/users/${userToDelete}`)
                .then(() => {
                    fetchUsers(); 
                    setIsDeleteModalOpen(false);
                    setUserToDelete(null);
                })
                .catch(error => {
                    console.error('Error deleting user:', error);
                });
        }
    };
  
  return (
    <div className='max-w-none flex-col lg:flex-row lg:items-start lg:justify-start flex-grow'>
    <div className="lg:w-1/5">
        <Sidebar />
    </div>
            <section className="bg-gray-100 dark:bg-gray-900 antialiased flex-grow mt-3">
                <div className="mx-auto px-4 lg:px-12">
                    <div className="flex-1 ml-0 md:ml-16 lg:ml-48 lg:pl-2 pt-20 lg:pt-0">
                        <div className="bg-white dark:bg-gray-800 relative shadow-md sm:rounded-lg overflow-hidden">
                            <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
                                {/* Search form */}
                                <div className="w-full md:w-1/2">
                                    <form className="flex items-center">
                                        <label htmlFor="simple-search" className="sr-only">Search</label>
                                        <div className="relative w-full">
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                <svg aria-hidden="true" className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <input
                                                    type="text"
                                                    id="simple-search"
                                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" 
                                                    placeholder="Search"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                />

                                        </div>
                                    </form>
                                </div>
                                {/* Buttons */}
                                <div className="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
                                    {/* Add User button */}
                                    <button
                                        type="button"
                                        id="createProductModalButton" 
                                        className="flex items-center justify-center text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-semibold rounded-md py-2 px-4 "
                                        onClick={handleModalToggle}>
                                        <IoMdAdd className="mr-2"/>
                                        Add User
                                    </button>
                                </div>
                            </div>
                            {/* Table */}
                            <div className="overflow-x-auto max-w-none">
                                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 table-fixed">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                        <tr>
                                            <th scope="col" className="px-4 py-4 w-1/3 text-left">Name</th>
                                            <th scope="col" className="px-4 py-3 w-1/3 text-center">Email</th>
                                            <th scope="col" className="px-4 py-3 w-1/3 text-right">
                                                <span className="sr-only">Actions</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    {currentUsers.map((user, index) => (
                                        <tr key={user._id} className="border-b dark:border-gray-700">
                                            <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">{user.username}</td>
                                            <td className="px-4 py-3 text-center">{user.email}</td>
                                            <td className="px-4 py-3 flex items-center justify-end" ref={(el) => (dropdownRefs.current[index] = el)}>
                                                <button
                                                    className="inline-flex items-center text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 p-1.5 dark:hover-bg-gray-800"
                                                    type="button"
                                                    onClick={() => toggleDropdown(index)}
                                                >
                                                    <svg
                                                        className="w-5 h-5"
                                                        aria-hidden="true"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                                                    </svg>
                                                </button>
                                                {/* Dropdown content */}
                                                {openDropdowns[index] && (
                                                    <div id="dropdown" className="absolute z-10 bg-white rounded shadow dark:bg-gray-700">
                                                        <ul className="py-1 text-x" aria-labelledby="dropdown-button">
                                                            <li>
                                                                <button
                                                                    className="flex w-full items-center py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                                                                    onClick={() => handleEditClick(user)}
                                                                >
                                                                    <FiEdit className="w-4 h-4 mr-2" />
                                                                    Edit
                                                                </button>
                                                            </li>
                                                            <li>
                                                                <button className="flex w-full items-center py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                                                                    onClick={() => handlePreviewClick(user)}
                                                                >
                                                                    <FaEye className="w-4 h-4 mr-2" />
                                                                    Preview
                                                                </button>
                                                            </li>
                                                            <li>
                                                                <button className="flex w-full items-center py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 text-red-500 dark:hover:text-red-600"
                                                                    onClick={() => handleDeleteClick(user._id)} >
                                                                    <MdDelete className="w-4 h-4 mr-2" />
                                                                    Delete
                                                                </button>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>

                                </table>
                            </div>
                            {/* Pagination */}
                            <nav className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4" aria-label="Table navigation">
                                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                    Showing {indexOfFirstUser + 1}-{indexOfLastUser} of {users.length}
                                </span>
                                <ul className="inline-flex items-stretch -space-x-px">
                                    {Array.from({ length: Math.ceil(users.length / usersPerPage) }).map((_, index) => (
                                        <li key={index}>
                                            <button
                                                onClick={() => paginate(index + 1)}
                                                className={`flex items-center justify-center text-sm py-2 px-3 leading-tight ${currentPage === index + 1 ? 'text-primary-600 bg-primary-100' : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700'} ${index === 0 ? 'rounded-l-lg' : ''} ${index === Math.ceil(users.length / usersPerPage) - 1 ? 'rounded-r-lg' : ''}`}
                                            >
                                                {index + 1}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>
            </section>
                                    

  {isAddModalOpen && (
        <div id="createProductModal" className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden flex justify-center items-center bg-gray-300 bg-opacity-75">
            {/* <!-- Modal content --> */}
            <div className="relative p-4 bg-white rounded-lg shadow sm:p-5">
                {/* <!-- Modal header --> */}
                <div className="flex justify-between items-center pb-4 mb-4 rounded-t border-b sm:mb-5 dark:border-gray-600">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add User</h3>
                    <button 
                        type="button" 
                        onClick={handleModalToggle} 
                        className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                        <IoMdClose className="w-5 h-5"/>
                        <span className="sr-only">Close modal</span>
                    </button>
                </div>
                {/* <!-- Modal body --> */}
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 mb-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Name</label>
                            <input type="text" name="username" id="username" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Type user name" required=""/>
                        </div>
                        <div>
                            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email</label>
                            <input type="text" name="email" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Email" required=""/>
                        </div>
                        <div>
                            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                            <input type="password" name="password" id="password" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Password" required=""/>
                        </div>
                    </div>
                    <button type="submit" className="text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none px-4 py-2 rounded-lg">
                      <svg className="mr-1 -ml-1 w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
                      </svg>
                      Add new user
                   </button>
                </form>
            </div>
        </div>
    )}
     <div>
       {addSuccessMessage && (
           <div className="fixed top-0 right-0 mt-4 mr-4 bg-green-500 text-white px-4 py-2 rounded">
               {addSuccessMessage}
           </div>
       )}
        
   </div>
   <div>
    {updateValidationMessage && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-red-500 text-white px-4 py-2 rounded">
                {updateValidationMessage}
            </div>
        </div>
    )}
</div>


{/* <!-- Update modal --> */}
{isModalOpen && (
    
    <div id="updateProductModal" className={`${isModalOpen ? '' : 'hidden'} fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full h-full bg-black bg-opacity-50`}>

        <div className="relative p-4 w-full max-w-2xl">
            {/* <!-- Modal content --> */}
            
            <div className="relative p-4 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
                {/* <!-- Modal header --> */}
                <div className="flex justify-between items-center pb-4 mb-4 rounded-t border-b sm:mb-5 dark:border-blue-600">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Update Product</h3>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white">
                        <IoMdClose className="w-5 h-5"/>
                        <span className="sr-only">Close modal</span>
                    </button>
                </div>
                {/* <!-- Modal body --> */}
                {currentUser && (
                <form action="#" onSubmit={(e) => { e.preventDefault(); handleUpdate(); }}>
                    <div className="grid gap-4 mb-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Name</label>
                            <input type="text" 
                            name="username" 
                            id="username"
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                            value={updatedUser.username} onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email</label>
                            <input type="text" name="email" id="email" value={updatedUser.email} onChange={handleInputChange}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" 
                            />
                        </div>
                        <div>
                          <label htmlFor="role" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Role</label>
                          <select id="role" name="role" value={updatedUser.role} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500">
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                           </select>
                       </div>    
                    </div>
                    <div className="flex items-center space-x-4">
                        <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blues-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Update User</button>
                        <button type="button" 
                            onClick={() => {
                                handleDeleteClick(currentUser._id); 
                                setIsModalOpen(false);
                            }} 
                            className="inline-flex items-center text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-red-900">
                            < MdDelete className="w-5 h-5 mr-1.5 -ml-1" />
                            Delete
                        </button>
                    </div>
                </form>
                )}
            </div>
        </div>
    </div>
    
  )}
  <div>
        {updateSuccessMessage && (
            <div className="fixed top-0 right-0 mt-4 mr-4 bg-green-500 text-white px-4 py-2 rounded">
                {updateSuccessMessage}
            </div>
        )}
    </div>
    <div>
    {updateValidationMessage && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-red-500 text-white px-4 py-2 rounded">
                {updateValidationMessage}
            </div>
        </div>
    )}
</div>
{/* <!-- Read modal --> */}
<div id="readProductModal" className={`${isPreviewModalOpen ? '' : 'hidden'} fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full h-full bg-black bg-opacity-50`}>
    <div className="relative p-4 w-full max-w-xl">
        <div className="relative p-4 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
            
            <div className="flex justify-between items-center pb-4 mb-4 rounded-t border-b sm:mb-5 dark:border-gray-600">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Details</h3>
                <button type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 inline-flex dark:hover:bg-gray-600 dark:hover:text-white" 
                        onClick={() => setIsPreviewModalOpen(false)}>
                    <IoMdClose className="w-5 h-5"/>
                    <span className="sr-only">Close modal</span>
                </button>
            </div>
            <dl>
                <dt className="mb-2 font-semibold leading-none text-gray-900 dark:text-white">Name</dt>
                <dd className="mb-4 font-light text-gray-500 sm:mb-5 dark:text-gray-400">{currentPreviewedUser && currentPreviewedUser.username}</dd>
                <dt className="mb-2 font-semibold leading-none text-gray-900 dark:text-white">Email</dt>
                <dd className="mb-4 font-light text-gray-500 sm:mb-5 dark:text-gray-400">{currentPreviewedUser && currentPreviewedUser.email}</dd>
                <dt className="mb-2 font-semibold leading-none text-gray-900 dark:text-white">Role</dt>
                <dd className="mb-4 font-light text-gray-500 sm:mb-5 dark:text-gray-400">{currentPreviewedUser && currentPreviewedUser.role}</dd>
                
            </dl>
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3 sm:space-x-4">
                    <button onClick={() => handleEditClick(currentPreviewedUser, true)} type="button" className="text-white inline-flex items-center bg-blue-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                        <FiEdit className="mr-1 -ml-1 w-5 h-5" />
                        Edit
                    </button>
                </div>
                <button type="button" 
                    onClick={() => {
                        handleDeleteClick(currentPreviewedUser._id); 
                        setIsPreviewModalOpen(false);
                    }} 
                    className="inline-flex items-center text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-red-900">
                    < MdDelete className="w-5 h-5 mr-1.5 -ml-1" />
                    Delete
                </button>
            </div>
        </div>
    </div>
</div>

{/* <!-- Delete modal --> */}
{isDeleteModalOpen && (
<div id="deleteModal" tabIndex="-1" aria-hidden="true" className="fixed inset-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
    <div className="relative p-4 w-full max-w-md max-h-full">
        {/* <!-- Modal content --> */}
        <div className="relative p-4 text-center bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
            
            <button onClick={() => setIsDeleteModalOpen(false)} type="button" className="text-gray-400 absolute top-2.5 right-2.5 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white">
                <IoMdClose className="w-5 h-5"/>
                <span className="sr-only">Close modal</span>
            </button>
            <svg className="text-gray-400 dark:text-gray-500 w-11 h-11 mb-3.5 mx-auto" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="mb-4 text-gray-500 dark:text-gray-300">Are you sure you want to delete this item?</p>
            <div className="flex justify-center items-center space-x-4">
                <button onClick={() => setIsDeleteModalOpen(false)}  type="button" className="py-2 px-3 text-sm font-medium text-gray-500 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-primary-300 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600">No, cancel</button>
                <button onClick={handleConfirmDelete} type="submit" className="py-2 px-3 text-sm font-medium text-center text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-red-900">Yes, I'm sure</button>
            </div>
        </div>
    </div>
</div>
)}
</div> 
    );
}

export default Users;