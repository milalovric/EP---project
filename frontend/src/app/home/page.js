"use client"
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation'; 
import Sidebar from '../home/sidebar';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || role !== 'user') {
      router.push('/'); 
    }
  }, []);

  return (
    <div>
      <Sidebar/>
    </div>
  );
}