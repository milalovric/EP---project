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


const Tasks = () => {
    
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [currentTask, setCurrentTask] = useState({});
    const [tasks, setTasks] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [tasksPerPage] = useState(10);
    const [openDropdowns, setOpenDropdowns] = useState(Array(tasks.length).fill(false));
    const dropdownRefs = useRef([]);
    const [addSuccessMessage, setAddSuccessMessage] = useState('');
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    // update
    const [updatedTask, setUpdatedTask] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [updateSuccessMessage, setUpdateSuccessMessage] = useState('');
    //read
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [currentPreviewedTask, setCurrentPreviewedTask] = useState(null);
    const [cameFromReadModal, setCameFromReadModal] = useState(false);
    //delete
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);
    
    

    useEffect(() => {
        fetchTasks(); 
        fetchUsers();
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
      }, [searchQuery]);
      const fetchTasks = async () => {
        try {
            const response = await axios.get(`http://localhost:3001/task?search=${searchQuery}`);
            setTasks(response.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

//     useEffect(() => {
//     if (currentTask) {
//         
//     }
// }, [currentTask]);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/users');
            const filteredUsers = response.data.filter(user => user.role === "user");
            setUsers(filteredUsers);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };
    

    const indexOfLastTask = currentPage * tasksPerPage;
    const indexOfFirstTask = indexOfLastTask - tasksPerPage;
    const currentTasks = tasks.slice(indexOfFirstTask, indexOfLastTask);

    
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
    

    
//  task add
const handleSubmit = async (event) => {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    const selectedUsers = Array.from(formData.getAll('users'));
    const usersString = selectedUsers.join(' ');

    const taskData = {
        tasks: formData.get('tasks'),
        users: usersString.split(' '), 
        deadline: formData.get('deadline'),
        hours: formData.get('hours'),
        status: formData.get('status')
    };
    console.log('Task data:', taskData);

    try {
        const response = await axios.post('http://localhost:3001/task', taskData);
        console.log('Task added:', response.data);
        fetchTasks();
        setIsAddModalOpen(false); 
        setAddSuccessMessage('Task created successfully!');
        setTimeout(() => {
            setAddSuccessMessage('');
        }, 5000);
    } catch (error) {
        console.error('Error adding task:', error);
    }
};

    const handleModalToggle = () => {
        setIsAddModalOpen(!isAddModalOpen);
    };


    //edit
    
    const handleEditClick = (task, cameFromRead = false) => {
        console.log("Edit button clicked, task:", task); 
        setCurrentTask(task); 
        setUpdatedTask(task); 
        setIsModalOpen(true); 
        setIsPreviewModalOpen(false);
        setCameFromReadModal(cameFromRead);
    };
    
    const handleInputChange = (event) => {
        const target = event.target;
        let value = target.type === 'checkbox' ? target.checked : target.value;
        let name = target.name;
    
        if (target.type === 'checkbox') {
            let updatedValue = Array.isArray(updatedTask.user) ? updatedTask.user : [];
            const user = users.find(user => user.username === target.value);
            if (value) {
                updatedValue = [...updatedValue, user.username];
            } else {
                updatedValue = updatedValue.filter(item => item !== user.username);
            }
            setUpdatedTask({
                ...updatedTask,
                user: updatedValue
            });
        } else {
            setUpdatedTask({
                ...updatedTask,
                [name]: value
            });
        }
    };
    
    const handleUpdate = async () => {
        try {
            const response = await axios.put(`http://localhost:3001/task/${currentTask._id}`, updatedTask);
            setTasks(tasks.map(task => task._id === currentTask._id ? response.data : task));
            setIsModalOpen(false);
            setCurrentPreviewedTask(response.data);
            setUpdateSuccessMessage('Task updated successfully!');
            setTimeout(() => {
                setUpdateSuccessMessage('');
            }, 5000);
            
            if (cameFromReadModal) {
                setIsPreviewModalOpen(true);
                setCameFromReadModal(false);
            }
        } catch (error) {
            console.error('Failed to update task:', error);
        }
    }
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); 
        const year = date.getFullYear();

        return `${day}.${month}.${year}.`;
    }

    const formatDateForInput = (dateString) => {
        return new Date(dateString).toISOString().split('T')[0];
    }
    
    //read

    const handlePreviewClick = (task) => {
        setCurrentPreviewedTask(task);
        setIsPreviewModalOpen(true);
        setIsModalOpen (false);
    };


    // delete 
    const handleDeleteClick = (id) => {
        setIsDeleteModalOpen(true);
        setTaskToDelete(id);
    };

    const handleConfirmDelete = () => {
        if (taskToDelete) {
            axios.delete(`http://localhost:3001/task/${taskToDelete}`)
                .then(() => {
                    fetchTasks(); 
                    setIsDeleteModalOpen(false);
                    setTaskToDelete(null);
                })
                .catch(error => {
                    console.error('Error deleting task:', error);
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
                <div className="flex-1 ml-0 md:ml-16 lg:ml-48 lg:pl-2">
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
                                {/* Add Task button */}
                                <button
                                    type="button"
                                    id="createProductModalButton" 
                                    className="flex items-center justify-center text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-semibold rounded-md py-2 px-4 "
                                    onClick={handleModalToggle}>
                                    <IoMdAdd className="mr-2"/>
                                    Add Task
                                </button>
                            </div>
                        </div>
                        {/* Table */}
                        <div className="overflow-x-auto max-w-none">
                            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 table-fixed">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th scope="col" className="px-4 py-4 w-1/5 text-center">Task</th>
                                        <th scope="col" className="px-4 py-3 w-1/5 text-center">User</th>
                                        <th scope="col" className="px-4 py-3 w-1/5 text-center">Deadline</th>
                                        <th scope='col' className="px-4 py-3 w-1/5 text-center">Hours</th>
                                        <th scope="col" className="px-4 py-3 w-1/5 text-center">Status</th>
                                        <th scope="col" className="px-4 py-3 w-1/5 text-center">
                                            <span className="sr-only text-right">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                {currentTasks.map((task, index) => (
                                    <tr key={task._id} className="border-b dark:border-gray-700">
                                        <td className="px-4 py-3 font-medium text-gray-900 whitespace-normal dark:text-white text-center break-all overflow-auto">{task.tasks}</td>
                                        <td className="px-4 py-3 text-center break-all overflow-auto  ">{task.user.join(' ')}</td>
                                        <td className="px-4 py-3 text-center ">{formatDate(task.deadline)}</td>
                                        <td className="px-4 py-3 text-center ">{task.hours || "--:--"}</td>
                                        <td className="px-4 py-3 text-center ">{task.status}</td>
                                        <td className="px-4 py-3 items-center text-center" ref={(el) => (dropdownRefs.current[index] = el)}>
                                            <button
                                                className="inline-flex items-center text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 p-1.5 dark:hover-bg-gray-800 "
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
                                                                onClick={() => handleEditClick(task)}
                                                            >
                                                                <FiEdit className="w-4 h-4 mr-2" />
                                                                Edit
                                                            </button>
                                                        </li>
                                                        <li>
                                                            <button className="flex w-full items-center py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                                                                onClick={() => handlePreviewClick(task)}
                                                            >
                                                                <FaEye className="w-4 h-4 mr-2" />
                                                                Preview
                                                            </button>
                                                        </li>
                                                        <li>
                                                            <button className="flex w-full items-center py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 text-red-500 dark:hover:text-red-600"
                                                                onClick={() => handleDeleteClick(task._id)} >
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
                                Showing {indexOfFirstTask + 1}-{indexOfLastTask} of {tasks.length}
                            </span>
                            <ul className="inline-flex items-stretch -space-x-px">
                                {Array.from({ length: Math.ceil(tasks.length / tasksPerPage) }).map((_, index) => (
                                    <li key={index}>
                                        <button
                                            onClick={() => paginate(index + 1)}
                                            className={`flex items-center justify-center text-sm py-2 px-3 leading-tight ${currentPage === index + 1 ? 'text-primary-600 bg-primary-100' : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700'} ${index === 0 ? 'rounded-l-lg' : ''} ${index === Math.ceil(tasks.length / tasksPerPage) - 1 ? 'rounded-r-lg' : ''}`}
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
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Task</h3>
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
                                <label htmlFor="tasks" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Task</label>
                                <textarea name="tasks" id="tasks" className="h-10 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Enter task" required=""/>
                            </div>
                            <div>
                                <label htmlFor="user" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Users</label>
                                {users.map(user => (
                                    <div key={user.username} className="flex items-center">
                                        <input 
                                            type="checkbox" 
                                            name="users" 
                                            value={user.username} 
                                            id={user.username} 
                                            className="text-primary focus:ring-primary-600 h-4 w-4" 
                                        />
                                        <label htmlFor={user.username} className="ml-2">{user.username}</label>
                                    </div>
                                ))}
                            </div>
    
                            <div>
                                <label htmlFor="deadline" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Deadline</label>
                                <input type="date" name="deadline" id="deadline" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Enter deadline" required=""/>
                            </div>
                            <div>
                                <label htmlFor="hours" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Hours</label>
                                <input type="time" name="hours" id="hours" value={updatedTask.hours} onChange={handleInputChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 "
                                required=""
                                />
                            </div>
                            <div>
                            <label htmlFor="status" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Status</label>
                            <select id="status" name="status" value={updatedTask.status || ""} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500">
                                <option value=""disabled >Select status</option>
                                <option value="Active">Active</option>
                                <option value="Done">Done</option>
                            </select>
                        </div>    
        
                        </div>
                        <button type="submit" className="text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none px-4 py-2 rounded-lg">
                        <svg className="mr-1 -ml-1 w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
                        </svg>
                        Add new task
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


    {/* <!-- Update modal --> */}
    {isModalOpen && (
        
        <div id="updateProductModal" className={`${isModalOpen ? '' : 'hidden'} fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full h-full bg-black bg-opacity-50`}>

            <div className="relative p-4 w-full max-w-2xl">
                {/* <!-- Modal content --> */}
                
                <div className="relative p-4 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
                    {/* <!-- Modal header --> */}
                    <div className="flex justify-between items-center pb-4 mb-4 rounded-t border-b sm:mb-5 dark:border-blue-600">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Update </h3>
                        <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white">
                            <IoMdClose className="w-5 h-5"/>
                            <span className="sr-only">Close modal</span>
                        </button>
                    </div>
                    {/* <!-- Modal body --> */}
                    {currentTask && (
                    <form action="#" onSubmit={(e) => { e.preventDefault(); handleUpdate(); }}>
                        <div className="grid gap-4 mb-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="tasks" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Task</label>
                                <textarea 
                                name="tasks" 
                                id="tasks" 
                                className="h-10 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                value={updatedTask.tasks} onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <label htmlFor="user" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Users</label>
                                
                                {users.map((user , index)=> (
                                    <div key={index} className="flex items-center">
                                        <input 
                                            type="checkbox" 
                                            name="user" 
                                            value={user.username} 
                                            id={user.username} 
                                            checked={updatedTask.user && updatedTask.user.includes(user.username)}
                                            onChange={handleInputChange} 
                                            className="text-primary focus:ring-primary-600 h-4 w-4" 
                                        />
                                        
                                        <label htmlFor={user.username} className="ml-2">{user.username}</label>
                                    </div>
                                ))}
                            </div>
                            <div>
                                <label htmlFor="deadline" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Deadline</label>
                                <input type="date" name="deadline" id="deadline" value={formatDateForInput(updatedTask.deadline)} onChange={handleInputChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" 
                                />
                            </div>
                            <div>
                            <label htmlFor="status" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Status</label>
                            <select id="status" name="status" value={updatedTask.status} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500">
                                <option value="Active">Active</option>
                                <option value="Done">Done</option>
                            </select>
                        </div>    
                        </div>
                        <div className="flex items-center space-x-4">
                            <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blues-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Update Task</button>
                            <button type="button" 
                                onClick={() => {
                                    handleDeleteClick(currentTask._id); 
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
                    <dt className="mb-2 font-semibold leading-none text-gray-900 dark:text-white">Task</dt>
                    <dd className="mb-4 font-light text-gray-500 sm:mb-5 dark:text-gray-400 break-all overflow-auto">{currentPreviewedTask && currentPreviewedTask.tasks}</dd>
                    <dt className="mb-2 font-semibold leading-none text-gray-900 dark:text-white">Users</dt>
                    <dd className="mb-4 font-light text-gray-500 sm:mb-5 dark:text-gray-400 break-all overflow-auto">{currentPreviewedTask && currentPreviewedTask.user.join(' ')}</dd>
                    <dt className="mb-2 font-semibold leading-none text-gray-900 dark:text-white">Deadline</dt>
                    <dd className="mb-4 font-light text-gray-500 sm:mb-5 dark:text-gray-400 break-all overflow-auto">{currentPreviewedTask && formatDate (currentPreviewedTask.deadline)}</dd>
                    <dt className="mb-2 font-semibold leading-none text-gray-900 dark:text-white">Hours</dt>
                    <dd className="mb-4 font-light text-gray-500 sm:mb-5 dark:text-gray-400 break-all overflow-auto">{currentPreviewedTask && currentPreviewedTask.hours || "--:--"}</dd>
                    <dt className="mb-2 font-semibold leading-none text-gray-900 dark:text-white">Status</dt>
                    <dd className="mb-4 font-light text-gray-500 sm:mb-5 dark:text-gray-400 break-all overflow-auto">{currentPreviewedTask && currentPreviewedTask.status}</dd>
                    
                </dl>
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                        <button onClick={() => handleEditClick(currentPreviewedTask, true)} type="button" className="text-white inline-flex items-center bg-blue-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                            <FiEdit className="mr-1 -ml-1 w-5 h-5" />
                            Edit
                        </button>
                    </div>
                    <button type="button" 
                        onClick={() => {
                            handleDeleteClick(currentPreviewedTask._id); 
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

export default Tasks;