import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {useEffect, useState} from "react";
import NavbarAuth from "../Layouts/NavbarAuth";
import NavbarGuest from "..//Layouts/NavbarGuest";

const Layout = () => {
    const { isAuthenticated, logout } = useAuth();

    return (
        <div className="bg-white dark:bg-gray-800">
            {isAuthenticated ? (
                <NavbarAuth />
            ) : (
                <NavbarGuest />
            )}

            <main className="bg-white dark:bg-gray-800">
                <Outlet/>
            </main>
        </div>
    );
};

export default Layout;
