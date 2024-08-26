"use client";
import React from 'react'
import Sidebar from '../sidebar';
import { useState } from 'react';
import { useEffect, useRef } from 'react';
import { FiEdit } from "react-icons/fi";
import { MdDelete } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import { CiCalendar, CiClock1 } from "react-icons/ci";
import { FaTasks } from "react-icons/fa";
import {RiGroupLine, RiUser3Line } from "react-icons/ri";


import axios from 'axios';
const Tasks = () => {
    const [currentTask, setCurrentTask] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [tasksPerPage] = useState(9);
    const taskRef = useRef(null);
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    // update
    const [updatedTask, setUpdatedTask] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [updateSuccessMessage, setUpdateSuccessMessage] = useState('');
    const [username, setUsername] = useState('');


    useEffect(() => {
        const handleClickOutside = (event) => {
            if (taskRef.current && !taskRef.current.contains(event.target)) {
                const taskElements = document.getElementsByClassName('task-text');
                for (let i = 0; i < taskElements.length; i++) {
                    taskElements[i].classList.add('line-clamp-2');
                }
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            setUsername(storedUsername);
        }
    }, []);
    useEffect(() => {
        if (username || searchQuery) {
            fetchTasks();
        }
    }, [username, searchQuery]);
    
    const fetchTasks = async () => {
        try {
            const response = await axios.get(`http://localhost:3001/task?search=${searchQuery}`);
            const filteredTasks = response.data.filter(task => {
                if (Array.isArray(task.user)) {
                    const shouldInclude = task.user.some(user => user.includes(username));
                    return shouldInclude;
                } else {
                    return false;
                }
            });
            setTasks(filteredTasks);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    const indexOfLastTask = currentPage * tasksPerPage;
    const indexOfFirstTask = indexOfLastTask - tasksPerPage;
    const currentTasks = tasks.slice(indexOfFirstTask, indexOfLastTask);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    
    //edit
    const handleEditClick = (task = false) => {
        console.log("Edit button clicked, task:", task);
        setCurrentTask(task);
        setUpdatedTask(task);
        setIsModalOpen(true);
       
    };
    const handleInputChange = (event) => {
        console.log("Naziv svojstva:", event.target.name);
        console.log("Vrijednost svojstva:", event.target.value);
        console.log("Prije ažuriranja, updatedTask:", updatedTask);
        setUpdatedTask({
            ...updatedTask,
            [event.target.name]: event.target.value
        });
        console.log("Nakon ažuriranja, updatedTask:", updatedTask);
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
  
  return (
    <div className='max-w-none flex-col lg:flex-row lg:items-start lg:justify-start flex-grow'>
    <div className="lg:w-1/5">
    <Sidebar  />
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
                                                <svg aria-hidden="true" className="w-5 h-5 text-blue-800 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <input
                                                 type="text"
                                                 id="simple-search"
                                                 className="bg-gray-50 border border-blue-500 text-gray-900 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dark-blue-500 block w-full pl-10 p-2" 
                                                 placeholder="Search"
                                                 value={searchQuery}
                                                 onChange={(e) => setSearchQuery(e.target.value)}
                                             />
                                        </div>
                                    </form>
                                </div>
                                {/* Buttons */}
                                <div className="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
                                </div>
                            </div>
                            {/* Grid */}
                           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
    {currentTasks.map((task) => (
        <div key={task._id} className="w-full h-64 flex flex-col justify-between dark:bg-gray-800 bg-white dark:border-gray-700 rounded-lg border-2 border-blue-400 mb-6 py-5 px-6 overflow-hidden shadow-lg relative">
            <div>
                <div className="grid grid-cols-1 gap-1 items-start">
                    <div className="col-span-1">
                        <FaTasks className="text-gray-500 mr-2 align-middle inline-block" />
                    </div>
                    <div className="col-span-1">
                        <h3 
                            className={`task-text text-gray-900 mb-3 break-words ${task.tasks.length > 50 ? 'line-clamp-2 cursor-pointer' : ''}`}
                            onClick={(e) => {
                                if (task.tasks.length > 50) {
                                    e.target.classList.toggle('line-clamp-2');
                                }
                            }}
                            style={{ fontFamily: 'sans-serif', fontWeight: 600, wordWrap: 'break-word' }}
                        >
                            {task.tasks}
                        </h3>
                    </div>
                </div>
                <p className="text-gray-800 dark:text-gray-100 text-sm flex items-center mb-2">
                    {task.user.length > 1 ? <RiGroupLine className="text-gray-700 w-4 h-4 mr-2" /> : <RiUser3Line className="text-gray-700 w-4 h-4 mr-2" />}
                    {task.user.join(' ')}
                </p>
                <p className="text-gray-800 dark:text-gray-100 text-sm flex items-center mb-2">
                    <CiCalendar className="text-gray-900 w-6 h-6 mr-2" />
                    <span className="font-mono">{formatDate(task.deadline)}</span>
                </p>
                <p className="text-gray-800 dark:text-gray-100 text-sm flex items-center mb-2">
                    <CiClock1 className="text-gray-900 w-6 h-6 mr-3" />
                    {task.hours || "--:--"}
                </p>
                <p className="text-gray-800 dark:text-gray-100 text-sm ">
                    <span className={`inline-block px-2 py-1 rounded-lg ${task.status === 'Active' ? 'bg-blue-200 text-blue-800' : task.status === 'Expired' ? 'bg-red-200 text-red-800' : 'bg-blue-800 text-white'}`}>{task.status}</span>
                </p>
            
            </div>

            <div className="flex justify-end space-x-2 absolute bottom-5 right-5">
                <button
                    className="flex items-center py-2 px-4 "
                    onClick={() => handleEditClick(task)}
                >
                    <FiEdit className="w-6 h-6 text-blue-700" />
                </button>
            
            </div>
        </div>
    ))}
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
                          <label htmlFor="status" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Status</label>
                          <select id="status" name="status" value={updatedTask.status} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500">
                            <option value="Active">Active</option>
                            <option value="Done">Done</option>
                           </select>
                       </div> 
                          <div>
                             <label htmlFor="hours" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Hours</label>
                             <input type="time" id="hours" name="hours" value={updatedTask.hours} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" />
                            </div>   
                    </div>
                    <div className="flex items-center space-x-4 justify-end">
                        <button 
                            type="submit" 
                            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                                Update Task
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

</div> 
    );
}

export default Tasks;