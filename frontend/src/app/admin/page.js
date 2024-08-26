"use client"
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation'; 
import Sidebar from '../admin/sidebar';
import socket from '../home/task/socket'; // Import the socket

export default function AdminPanel() {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || role !== 'admin') {
      router.push('/'); 
    }
  }, []);

  const sendNotification = () => {
    const notification = { message: 'New notification from admin!' };
    socket.emit('sendNotification', notification);
  };

  return (
    <div>
      <Sidebar/>
      <button onClick={sendNotification}>Send Notification</button>
    </div>
  );
}