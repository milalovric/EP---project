"use client"
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; 
import Sidebar from '../home/sidebar';
import socket from './task/socket' // Import the socket

export default function Home() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || role !== 'user') {
      router.push('/'); 
    }

    // Join the socket room for the user
    const userId = localStorage.getItem('userId');
    socket.emit('joinRoom', userId);

    socket.on('receiveNotification', (data) => {
      console.log('Notification received:', data);
      setNotifications((prevNotifications) => [...prevNotifications, data]);
    });

    return () => {
      socket.off('receiveNotification');
    };
  }, []);

  return (
    <div>
      <Sidebar/>
      <div>
        <h2>Notifications</h2>
        <ul>
          {notifications.map((notification, index) => (
            <li key={index}>{notification.message}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}