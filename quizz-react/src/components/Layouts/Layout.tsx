import {Outlet, useLocation} from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {useEffect, useState} from "react";
import NavbarAuth from "../Layouts/NavbarAuth";
import NavbarGuest from "..//Layouts/NavbarGuest";

const Layout = () => {
    const { isAuthenticated, logout } = useAuth();
    const location = useLocation();
    return (
        <div className="bg-white dark:bg-gray-800">
            <div>
                {location.pathname.includes('/game') ? (
                    <span></span> // Rien affiché pour les pages de jeu
                ) : isAuthenticated ? (
                    <NavbarAuth /> // Navbar pour utilisateurs authentifiés
                ) : (
                    <NavbarGuest /> // Navbar pour invités
                )}
            </div>

            <main className=" bg-white dark:bg-gray-800 border-[1px] dark:border-white border-black-200">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
