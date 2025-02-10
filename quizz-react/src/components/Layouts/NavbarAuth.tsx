
import { Disclosure } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import DarkModeToggle from "../DarkToggle.tsx";
import {NavLink, useNavigate} from "react-router-dom";
import {useAuth} from "../../context/AuthContext.tsx";

const navigation = [
    { name: 'Accueil', href: '/'},
    { name: 'Jouer', href: 'dashboard'},
]

export default function NavbarAuth() {
    const {logout} = useAuth();
    const navigate = useNavigate()
    function logoutUser(){
        logout();
        navigate('/');
    }

    const username = localStorage.getItem('username');

    return (
        <Disclosure as="nav" className="bg-white dark:bg-slate-900 border-[1px] dark:border-white border-black-200">
            {({ open }) => (
                <>
                    <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
                        <div className="relative flex h-16 items-center justify-between">
                            <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                                <Disclosure.Button
                                    className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                                    <span className="absolute -inset-0.5"/>
                                    <span className="sr-only">Open main menu</span>
                                    {open ? (
                                        <XMarkIcon className="block h-6 w-6" aria-hidden="true"/>
                                    ) : (
                                        <Bars3Icon className="block h-6 w-6" aria-hidden="true"/>
                                    )}
                                </Disclosure.Button>
                            </div>
                            <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                                <div className="flex flex-shrink-0 items-center">
                                    <img src="/big-logo.png" className={"w-20"}/>
                                </div>
                                <div className="hidden sm:ml-6 sm:block">
                                    <div className="flex space-x-4">
                                        {navigation.map((item) => (
                                            <NavLink
                                                key={item.name}
                                                className={({isActive}) =>
                                                    isActive ? "text-[#FB5757] font-bold" : "text-gray-500"
                                                }
                                                to={item.href}
                                            >
                                                {item.name}
                                            </NavLink>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <p className={"dark:text-white ml-5 font-semibold first-letter:uppercase"}>{username}</p>
                            <div className="ml-5 flex gap-2 items-center bg-white dark:bg-slate-900">
                                <button title={"Déconnexion"}
                                        className="text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 p-2  text-[#FB5757]"
                                        onClick={logoutUser}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                                        <path fill="none" stroke="#FB5757" strokeLinecap="round"
                                              strokeLinejoin="round" strokeWidth="2"
                                              d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14l5-5l-5-5m5 5H9"/>
                                    </svg>
                                </button>
                                <DarkModeToggle/>
                            </div>
                        </div>
                    </div>

                    <Disclosure.Panel className="sm:hidden">
                        <div className="space-y-1 px-2 pb-3 pt-2">
                        {navigation.map((item) => (
                                <NavLink
                                    key={item.name}
                                    className={({ isActive }) =>
                                        isActive ? "dark:text-[#FB5757] text-[#FB5757]" : "dark:text-white text-black hover:bg-gray-700 hover:text-white',\n" +
                                            "                                        'block rounded-md px-3 py-2 text-base font-medium"
                                    }
                                    to={item.href}
                                >
                                    {item.name}
                                </NavLink>
                            ))}
                        </div>
                    </Disclosure.Panel>
                </>
            )}
        </Disclosure>
    )
}
