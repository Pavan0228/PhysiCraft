import { useState, useEffect } from "react";
import {
    Menu,
    X,
    Atom,
    Compass,
    Zap,
    Globe,
    Waves,
    ArrowUpRight,
    Orbit,
    Music,
    Droplets,
    Target,
    Eye,
    Magnet,
    Snowflake,
    ChevronRight,
    ChevronLeft,
    Sun,
    Moon,
    CircleOff,
} from "lucide-react";

import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

export default function PhysicsSidebar({ isOpen, setIsOpen }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeItem, setActiveItem] = useState("Home");
    const [scrolled, setScrolled] = useState(false);
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navItems = [
        { name: "Home", path: "/", icon: <Globe className="w-5 h-5" /> },
        {
            name: "Pendulum",
            path: "/pendulum",
            icon: <Compass className="w-5 h-5" />,
        },
        { name: "Wave", path: "/wave", icon: <Waves className="w-5 h-5" /> },
        {
            name: "Electric Fields",
            path: "/electric",
            icon: <Zap className="w-5 h-5" />,
        },
        {
            name: "Relativity",
            path: "/relativity",
            icon: <ArrowUpRight className="w-5 h-5" />,
        },
        {
            name: "Orbital",
            path: "/orbital",
            icon: <Orbit className="w-5 h-5" />,
        },
        {
            name: "Quantum",
            path: "/quantum",
            icon: <Atom className="w-5 h-5" />,
        },
        {
            name: "Harmonic",
            path: "/harmonic",
            icon: <Music className="w-5 h-5" />,
        },
        {
            name: "Collision",
            path: "/collision",
            icon: <CircleOff className="w-5 h-5" />,
        },
        {
            name: "Fluids",
            path: "/fluids",
            icon: <Droplets className="w-5 h-5" />,
        },
        {
            name: "Projectile",
            path: "/projectile",
            icon: <Target className="w-5 h-5" />,
        },
        { name: "Lens", path: "/lens", icon: <Eye className="w-5 h-5" /> },
        {
            name: "Magnet",
            path: "/magnet",
            icon: <Magnet className="w-5 h-5" />,
        },
        {
            name: "Entropy",
            path: "/entropy",
            icon: <Snowflake className="w-5 h-5" />,
        },
    ];

    return (
        <div className="flex h-screen">
            {/* Desktop Sidebar */}
            <div
                className={`fixed top-0 left-0 h-full bg-slate-900 dark:bg-slate-950 transition-all duration-300 shadow-xl ${
                    isOpen ? "w-64" : "w-20"
                } hidden md:block z-40`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div
                        className={`flex items-center justify-between py-6 ${
                            isOpen ? "px-6" : "px-4"
                        }`}
                    >
                        {isOpen ? (
                            <div className="flex items-center text-white font-bold text-xl">
                                <Atom className="w-8 h-8 mr-2 text-blue-400 dark:text-blue-300 animate-pulse" />
                                <span className="text-white">Physics</span>
                                <span className="text-blue-400 dark:text-blue-300">
                                    Lab
                                </span>
                            </div>
                        ) : (
                            <Atom className="w-10 h-10 mx-auto text-blue-400 dark:text-blue-300 animate-pulse" />
                        )}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-slate-800"
                        >
                            {isOpen ? (
                                <ChevronLeft className="w-5 h-5" />
                            ) : (
                                <ChevronRight className="w-5 h-5" />
                            )}
                        </button>
                    </div>

                    {/* Nav Items */}
                    <div
                        className={`flex-1 py-6 flex flex-col space-y-1 ${
                            isOpen ? "overflow-y-auto" : "overflow-hidden"
                        }`}
                    >
                        {navItems.map((item, index) => (
                            <Link
                                key={index}
                                to={item.path}
                                onClick={() => setActiveItem(item.name)}
                                className={`flex items-center ${
                                    isOpen ? "px-6" : "justify-center px-3"
                                } py-3 text-sm font-medium rounded-lg mx-3 transition-all ${
                                    activeItem === item.name
                                        ? "bg-blue-600/20 text-blue-400 dark:text-blue-300"
                                        : "text-gray-300 hover:bg-slate-800 hover:text-white"
                                }`}
                            >
                                <span className="flex-shrink-0 text-blue-400 dark:text-blue-300">
                                    {item.icon}
                                </span>
                                {isOpen && (
                                    <span className="ml-6">{item.name}</span>
                                )}
                            </Link>
                        ))}
                    </div>

                    {/* Theme Toggle Button */}
                    <div
                        className={`py-6 ${
                            isOpen ? "px-6" : "px-4"
                        } flex justify-${isOpen ? "end" : "center"}`}
                    >
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full bg-slate-800 dark:bg-slate-700 text-gray-300 hover:text-white hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors"
                            title={
                                isOpen
                                    ? `Switch to ${
                                          theme === "light" ? "dark" : "light"
                                      } mode`
                                    : ""
                            }
                        >
                            {theme === "light" ? (
                                <Moon className="w-5 h-5" />
                            ) : (
                                <Sun className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Header */}
            <div
                className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${
                    scrolled
                        ? "bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-sm shadow-lg"
                        : "bg-gradient-to-b from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900"
                } md:hidden`}
            >
                <div className="flex items-center justify-between h-16 px-4">
                    <div className="flex items-center text-white font-bold text-xl">
                        <Atom className="w-8 h-8 mr-2 text-blue-400 dark:text-blue-300 animate-pulse" />
                        <span className="text-white">Physics</span>
                        <span className="text-blue-400 dark:text-blue-300">
                            Lab
                        </span>
                    </div>
                    <div className="flex items-center space-x-3">
                        {/* Mobile Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-1.5 rounded-full bg-slate-800 dark:bg-slate-700 text-gray-300 hover:text-white"
                        >
                            {theme === "light" ? (
                                <Moon className="w-5 h-5" />
                            ) : (
                                <Sun className="w-5 h-5" />
                            )}
                        </button>
                        <button
                            onClick={() =>
                                setIsMobileMenuOpen(!isMobileMenuOpen)
                            }
                            className="text-gray-400 hover:text-white p-1"
                        >
                            {isMobileMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-20 md:hidden">
                    <div
                        className="fixed inset-0 bg-black/50"
                        onClick={() => setIsMobileMenuOpen(false)}
                    ></div>
                    <div className="fixed top-16 right-0 bottom-0 w-64 bg-slate-900 dark:bg-slate-950 shadow-xl overflow-y-auto">
                        <div className="py-4 px-2 space-y-1">
                            {navItems.map((item, index) => (
                                <Link
                                    key={index}
                                    to={item.path}
                                    onClick={() => {
                                        setActiveItem(item.name);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg mx-2 ${
                                        activeItem === item.name
                                            ? "bg-blue-600/20 text-blue-400 dark:text-blue-300"
                                            : "text-gray-300 hover:bg-slate-800 hover:text-white"
                                    }`}
                                >
                                    <span className="text-blue-400 dark:text-blue-300 mr-3">
                                        {item.icon}
                                    </span>
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
