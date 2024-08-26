"use client";
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../sidebar';
import { FiEdit } from "react-icons/fi";
import { MdDelete } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import { CiCalendar, CiClock1 } from "react-icons/ci";
import { FaTasks } from "react-icons/fa";
import { RiGroupLine, RiUser3Line } from "react-icons/ri";
import axios from 'axios';

const Tasks = () => {
    const [currentTask, setCurrentTask] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [tasksPerPage] = useState(9);
    const taskRef = useRef(null);
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [updatedTask, setUpdatedTask] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [updateSuccessMessage, setUpdateSuccessMessage] = useState('');
    const [username, setUsername] = useState('');

    // WebSocket reference
    const ws = useRef(null);

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

    // WebSocket connection setup
    useEffect(() => {
        ws.current = new WebSocket('ws://localhost:3001');

        ws.current.onopen = () => {
            console.log('WebSocket connection established');
            ws.current.send('Hello from the frontend!');
        };

        ws.current.onmessage = (event) => {
            console.log('Received message from server:', event.data);
        };

        ws.current.onclose = () => {
            console.log('WebSocket connection closed');
        };

        ws.current.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        // Cleanup on unmount
        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, []);

    const indexOfLastTask = currentPage * tasksPerPage;
    const indexOfFirstTask = indexOfLastTask - tasksPerPage;
    const currentTasks = tasks.slice(indexOfFirstTask, indexOfLastTask);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
                                                        ref={taskRef}
                                                    >
                                                        {task.tasks}
                                                    </h3>
                                                </div>
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-300 mt-2 mb-2">{task.taskDescription}</p>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                                <CiCalendar className="inline-block mr-2" /> {formatDate(task.date)}
                                            </p>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                                <CiClock1 className="inline-block mr-2" /> {task.time}
                                            </p>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                                <RiGroupLine className="inline-block mr-2" /> {task.user.join(', ')}
                                            </p>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                                <RiUser3Line className="inline-block mr-2" /> {task.createdBy}
                                            </p>
                                        </div>
                                        <div className="flex justify-end mt-4">
                                            <button
                                                className="text-gray-500 dark:text-gray-300 text-sm mr-4"
                                                onClick={() => handleEditClick(task)}
                                            >
                                                <FiEdit className="inline-block mr-2" /> Edit
                                            </button>
                                            <button className="text-red-500 dark:text-red-400 text-sm">
                                                <MdDelete className="inline-block mr-2" /> Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-center mt-6">
                                <nav className="inline-flex -space-x-px">
                                    <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 text-gray-500 bg-white rounded-l-lg border border-blue-500 hover:bg-blue-100 dark:bg-gray-800 dark:text-gray-400">
                                        Previous
                                    </button>
                                    <button onClick={() => paginate(currentPage + 1)} disabled={indexOfLastTask >= tasks.length} className="px-4 py-2 text-gray-500 bg-white rounded-r-lg border border-blue-500 hover:bg-blue-100 dark:bg-gray-800 dark:text-gray-400">
                                        Next
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-gray-900 opacity-50"></div>
                    <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden w-full max-w-md p-6">
                        <button
                            className="absolute top-3 right-3 text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
                            onClick={() => setIsModalOpen(false)}
                        >
                            <IoMdClose size={24} />
                        </button>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Edit Task</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Task</label>
                                <input
                                    type="text"
                                    name="tasks"
                                    value={updatedTask.tasks || ''}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full p-2 border border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dark-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                                <textarea
                                    name="taskDescription"
                                    value={updatedTask.taskDescription || ''}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full p-2 border border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dark-blue-500"
                                />
                            </div>
                            <div className="flex justify-end mt-4">
                                <button
                                    onClick={handleUpdate}
                                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                        {updateSuccessMessage && (
                            <div className="mt-4 text-green-500 font-bold">
                                {updateSuccessMessage}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Tasks;
