import {Outlet} from 'react-router-dom';
import {useAuth } from '../../context/AuthContext';
import NavbarAuth from "../Layouts/NavbarAuth";
import NavbarGuest from "..//Layouts/NavbarGuest";

const Layout = () => {
    const { isAuthenticated} = useAuth();
    return (
        <div className="bg-white dark:bg-gray-800">
            <div>
                {isAuthenticated ? (
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
