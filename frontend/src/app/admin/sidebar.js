import { Disclosure } from '@headlessui/react';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GiHamburgerMenu } from 'react-icons/gi';
import { CgProfile, CgLogOut } from 'react-icons/cg';
import { FaUsers, FaTasks } from 'react-icons/fa';
import Link from 'next/link';

export default function Sidebar({ isVisible }) {
  const router = useRouter();
  const [username, setUsername] = useState('');

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) return;

        const res = await fetch(`http://localhost:3001/api/users/${userId}`);
        const data = await res.json();
        setUsername(data.username);
      } catch (error) {
        console.error('Error fetching username:', error);
      }
    };

    fetchUsername();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    window.history.replaceState({}, document.title, '/');
    router.push('/');
  };

  return (
    <div>
      <Disclosure as="nav">
        <Disclosure.Button className="absolute top-4 right-4 inline-flex items-center peer justify-center rounded-md p-2 text-blue-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:rind-white group hover:bg-blue-700">
          <GiHamburgerMenu className="block md:hidden h-6 w-6" aria-hidden="true" />
        </Disclosure.Button>
        <Disclosure.Panel
          static
          className={`p-6 w-1/2 h-screen bg-white z-20 fixed top-0 -left-96 lg:left-0 lg:w-60 peer-focus:left-0 peer:transition ease-out delay-150 duration-200 ${
            isVisible ? 'left-0' : '-left-96'
          }`}
        >
          <div className="flex flex-col justify-start items-center">
            <h1 className="text-base text-center cursor-pointer font-bold text-blue-900 border-b border-gray-100 pb-4 w-full">Admin Panel</h1>
            <div className="my-4 border-b border-grey-100 pb-4">
              <Link href="/admin/task">
                <div className="flex mb-2 justify-start items-center gap-4 pl-5 hover:bg-blue-700 p-2 rounded-md group cursor-pointer hover:shadow-lg">
                  <FaTasks className="text-2xl text-blue-700 group-hover:text-white" />
                  <h3 className="text-base text-blue-900 group-hover:text-white font-semibold">Task</h3>
                </div>
              </Link>
              <Link href="/admin/users">
                <div className="flex mb-2 justify-start items-center gap-4 pl-5 hover:bg-blue-700 p-2 rounded-md group cursor-pointer hover:shadow-lg">
                  <FaUsers className="text-2xl text-blue-700 group-hover:text-white" />
                  <h3 className="text-base text-blue-900 group-hover:text-white font-semibold">Users</h3>
                </div>
              </Link>
              <Link href="/admin/profile">
                <div className="flex mb-2 justify-start items-center gap-4 pl-5 hover:bg-blue-700 p-2 rounded-md group cursor-pointer hover:shadow-lg">
                  <CgProfile className="text-2xl text-blue-700 group-hover:text-white" />
                  <h3 className="text-base text-blue-900 group-hover:text-white font-semibold">{username || 'Loading...'}</h3>
                </div>
              </Link>
            </div>

            <div className="absolute bottom-5 left-13 flex items-center justify-center">
              <div
                onClick={handleLogout}
                className="flex mb-2 justify-start items-center gap-4 pl-5 border border-gray-200 hover:bg-blue-700 p-2 rounded-md group cursor-pointer hover:shadow-lg m-auto"
              >
                <CgLogOut className="text-2xl text-blue-700 group-hover:text-white " />
                <h3 className="text-base text-blue-900 group-hover:text-white font-semibold ">Logout</h3>
              </div>
            </div>
          </div>
        </Disclosure.Panel>
      </Disclosure>
    </div>
  );
}
