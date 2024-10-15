import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import logo from "../../src/images/Logo_Header.png";
import accIco from "../../src/images/icons8-account-48.png";

const Header = ({ user, setView, handleLogout }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate();

    const handleProfileClick = () => {
        setDropdownOpen(false);
        navigate('/profile');
    };

    return (
        <header className="bg-transparent w-full fixed top-0 left-0 z-5">
            <div className="container mx-auto flex justify-between items-center p-1">
                {/* Logo */}
                <div className="flex items-center space-x-6">
                    <img src={logo} alt="Logo" className="h-24 cursor-pointer" onClick={() => setView('Welcome')} />
                </div>

                {/* Right icons (Account, Favorites, Cart) */}
                <div className="flex items-center space-x-12">
                    {user && user.username ? (
                        <div className="relative">
                            <button
                                className="text-white hover:text-[#f7ecec] scale-130 rounded-full border border-transparent flex items-center hover:scale-130 hover:rounded-full hover:border hover:border-[#8eb1c3] hover:bg-black"
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                            >
                                <img width="24" height="24" src={accIco} alt="Account" />
                                <span className="ml-2">{user.username}</span>
                            </button>
                            {dropdownOpen && (
                                <div className=" bg-[#10082b] text-white absolute right-0 mt-2 w-48 bg-white rounded shadow-lg z-10">
                                    <ul className="bg-[#10082b] text-white py-1">
                                        <li
                                            className="bg-[#10082b] text-white block px-4 py-2 text-sm hover:bg-[#4c3f75] cursor-pointer"
                                            onClick={handleProfileClick}
                                        >
                                            Profile
                                        </li>
                                        <li className="bg-[#10082b] text-white block px-4 py-2 text-sm hover:bg-[#4c3f75] cursor-pointer">
                                            Settings
                                        </li>
                                        <li
                                            className="bg-[#10082b] text-white block px-4 py-2 text-sm hover:bg-[#4c3f75] cursor-pointer"
                                            onClick={handleLogout}
                                        >
                                            Logout
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="relative">
                            <button
                                className="text-white hover:text-[#f7ecec] scale-130 rounded-full border border-transparent flex items-center hover:scale-130 hover:rounded-full hover:border hover:border-[#8eb1c3] hover:bg-black"
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                            >
                                <img width="24" height="24" src={accIco} alt="Account" />
                                <span className="ml-2">Account</span>
                            </button>
                            {dropdownOpen && (
                                <div className="bg-[#10082b] text-white absolute right-0 mt-2 w-48 bg-white rounded shadow-lg z-10">
                                    <ul className="bg-[#10082b] text-white py-1">
                                        <li
                                            className="bg-[#10082b] text-white block px-4 py-2 text-sm hover:bg-[#4c3f75] cursor-pointer"
                                            onClick={() => setView('login')}
                                        >
                                            Log In
                                        </li>
                                        <li
                                            className="bg-[#10082b] text-white block px-4 py-2 text-sm hover:bg-[#4c3f75] cursor-pointer"
                                            onClick={() => setView('create-account')}
                                        >
                                            Create Account
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;