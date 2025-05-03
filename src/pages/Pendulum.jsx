import React, { useState, useEffect, useRef } from "react";
import { Compass, Play, Pause, RefreshCw, Sliders } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function PendulumPage() {
    const { theme } = useTheme();
    const [isRunning, setIsRunning] = useState(false);
    const [length, setLength] = useState(1);
    const [gravity, setGravity] = useState(9.8);
    const [angle, setAngle] = useState(30);

    // Animation state
    const [currentAngle, setCurrentAngle] = useState(0);
    const [angleVelocity, setAngleVelocity] = useState(0);
    const animationRef = useRef(null);
    const lastTimeRef = useRef(null);

    // Convert degrees to radians
    const toRadians = (degrees) => degrees * (Math.PI / 180);

    // Initialize pendulum position
    useEffect(() => {
        setCurrentAngle(toRadians(angle));
        setAngleVelocity(0);
    }, [angle]);

    // Animation loop
    useEffect(() => {
        if (!isRunning) {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                lastTimeRef.current = null;
            }
            return;
        }

        const updatePendulum = (time) => {
            if (lastTimeRef.current === null) {
                lastTimeRef.current = time;
                animationRef.current = requestAnimationFrame(updatePendulum);
                return;
            }

            const deltaTime = (time - lastTimeRef.current) / 1000; // convert to seconds
            lastTimeRef.current = time;

            // Pendulum physics - using the pendulum equation: d²θ/dt² = -(g/L)sin(θ)
            const acceleration = (-gravity / length) * Math.sin(currentAngle);

            // Update velocity and position with damping
            const newVelocity = angleVelocity + acceleration * deltaTime;
            const dampedVelocity = newVelocity * 0.998; // Apply slight damping
            const newAngle = currentAngle + dampedVelocity * deltaTime;

            setAngleVelocity(dampedVelocity);
            setCurrentAngle(newAngle);

            animationRef.current = requestAnimationFrame(updatePendulum);
        };

        animationRef.current = requestAnimationFrame(updatePendulum);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                lastTimeRef.current = null;
            }
        };
    }, [isRunning, gravity, length, currentAngle, angleVelocity]);

    // Toggle simulation
    const toggleSimulation = () => {
        setIsRunning(!isRunning);
    };

    // Reset simulation
    const resetSimulation = () => {
        setIsRunning(false);
        setLength(1);
        setGravity(9.8);
        setAngle(30);
        setCurrentAngle(toRadians(30));
        setAngleVelocity(0);
    };

    // Calculate bob position
    const bobX = 300 + Math.sin(currentAngle) * (length * 100);
    const bobY = 50 + Math.cos(currentAngle) * (length * 100);

    return (
        <div className="pt-16 md:pt-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="flex items-center mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg mr-3">
                    <Compass className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                        Pendulum Simulation
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Study the motion of simple and complex pendulums
                    </p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Simulation Controls */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 lg:col-span-1">
                    <div className="flex items-center mb-4">
                        <Sliders className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
                        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                            Controls
                        </h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Pendulum Length (m)
                            </label>
                            <input
                                type="range"
                                min="0.1"
                                max="2"
                                step="0.1"
                                value={length}
                                onChange={(e) =>
                                    setLength(parseFloat(e.target.value))
                                }
                                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                <span>0.1</span>
                                <span>{length.toFixed(1)}</span>
                                <span>2.0</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Gravity (m/s²)
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="20"
                                step="0.1"
                                value={gravity}
                                onChange={(e) =>
                                    setGravity(parseFloat(e.target.value))
                                }
                                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                <span>1.0</span>
                                <span>{gravity.toFixed(1)}</span>
                                <span>20.0</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Initial Angle (degrees)
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="90"
                                step="1"
                                value={angle}
                                onChange={(e) => {
                                    const newAngle = parseInt(e.target.value);
                                    setAngle(newAngle);
                                    if (!isRunning) {
                                        setCurrentAngle(toRadians(newAngle));
                                        setAngleVelocity(0);
                                    }
                                }}
                                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                <span>0°</span>
                                <span>{angle}°</span>
                                <span>90°</span>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-4">
                            <button
                                onClick={toggleSimulation}
                                className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md font-medium text-sm ${
                                    isRunning
                                        ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50"
                                        : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50"
                                }`}
                            >
                                {isRunning ? (
                                    <>
                                        <Pause className="w-4 h-4 mr-1" /> Pause
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-4 h-4 mr-1" /> Start
                                    </>
                                )}
                            </button>

                            <button
                                onClick={resetSimulation}
                                className="flex-1 flex items-center justify-center py-2 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md font-medium text-sm hover:bg-gray-200 dark:hover:bg-gray-600"
                            >
                                <RefreshCw className="w-4 h-4 mr-1" /> Reset
                            </button>
                        </div>
                    </div>
                </div>

                {/* Simulation View */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 lg:col-span-2">
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">
                        Simulation
                    </h2>
                    <div className="bg-gray-100 dark:bg-slate-900 rounded-lg h-80 flex items-center justify-center border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <svg width="600" height="320" viewBox="0 0 600 320">
                            {/* Grid lines */}
                            {Array.from({ length: 11 }).map((_, i) => (
                                <line
                                    key={`vline-${i}`}
                                    x1={i * 60}
                                    y1="0"
                                    x2={i * 60}
                                    y2="320"
                                    stroke={
                                        theme === "dark" ? "#2e3947" : "#e5e7eb"
                                    }
                                    strokeWidth="1"
                                />
                            ))}
                            {Array.from({ length: 6 }).map((_, i) => (
                                <line
                                    key={`hline-${i}`}
                                    x1="0"
                                    y1={i * 64}
                                    x2="600"
                                    y2={i * 64}
                                    stroke={
                                        theme === "dark" ? "#2e3947" : "#e5e7eb"
                                    }
                                    strokeWidth="1"
                                />
                            ))}

                            {/* Pendulum pivot */}
                            <circle
                                cx="300"
                                cy="50"
                                r="5"
                                fill={theme === "dark" ? "#a78bfa" : "#6d28d9"}
                            />

                            {/* Pendulum string */}
                            <line
                                x1="300"
                                y1="50"
                                x2={bobX}
                                y2={bobY}
                                stroke={
                                    theme === "dark" ? "#94a3b8" : "#4b5563"
                                }
                                strokeWidth="2"
                            />

                            {/* Pendulum bob */}
                            <circle
                                cx={bobX}
                                cy={bobY}
                                r={10 + length * 5}
                                fill={theme === "dark" ? "#a78bfa" : "#8b5cf6"}
                            />

                            {/* Arc indicating angle */}
                            <path
                                d="M 300,50 L 330,50 A 30 30 0 0 1 322,79"
                                fill="none"
                                stroke={
                                    isRunning
                                        ? theme === "dark"
                                            ? "#475569"
                                            : "#d1d5db"
                                        : theme === "dark"
                                        ? "#a78bfa"
                                        : "#8b5cf6"
                                }
                                strokeWidth="1.5"
                                strokeDasharray="4 2"
                                transform={`rotate(${
                                    isRunning ? 0 : angle
                                }, 300, 50)`}
                                opacity={isRunning ? 0.5 : 1}
                            />

                            {/* Angle indicator */}
                            {!isRunning && (
                                <text
                                    x="345"
                                    y="65"
                                    fill={
                                        theme === "dark" ? "#a78bfa" : "#6d28d9"
                                    }
                                    fontFamily="sans-serif"
                                    fontSize="12"
                                    fontWeight="bold"
                                >
                                    {angle}°
                                </text>
                            )}
                        </svg>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                            <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                                PERIOD
                            </p>
                            <p className="text-lg font-semibold text-purple-800 dark:text-purple-300">
                                {(
                                    2 *
                                    Math.PI *
                                    Math.sqrt(length / gravity)
                                ).toFixed(2)}
                                s
                            </p>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                ENERGY
                            </p>
                            <p className="text-lg font-semibold text-blue-800 dark:text-blue-300">
                                {(
                                    gravity *
                                    length *
                                    (1 - Math.cos((angle * Math.PI) / 180))
                                ).toFixed(2)}
                                J
                            </p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                            <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                                MAX VELOCITY
                            </p>
                            <p className="text-lg font-semibold text-green-800 dark:text-green-300">
                                {(
                                    2 *
                                    Math.sqrt(
                                        gravity *
                                            length *
                                            (1 -
                                                Math.cos(
                                                    (angle * Math.PI) / 180
                                                ))
                                    )
                                ).toFixed(2)}
                                m/s
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Theory Section */}
            <div className="mt-6 bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">
                    Theory
                </h2>
                <div className="prose dark:prose-invert max-w-none">
                    <h3>Simple Pendulum Motion</h3>
                    <p>
                        A simple pendulum consists of a point mass (bob)
                        suspended by a massless, unstretchable string. When
                        displaced from equilibrium and released, the pendulum
                        oscillates about its equilibrium position.
                    </p>
                    <h4>Key Equations:</h4>
                    <ul>
                        <li>
                            Period: T = 2π√(L/g) where L is length and g is
                            acceleration due to gravity
                        </li>
                        <li>
                            For small angles, the motion is approximately simple
                            harmonic motion
                        </li>
                        <li>
                            The frequency of oscillation is f = 1/T =
                            (1/2π)√(g/L)
                        </li>
                        <li>
                            Maximum speed occurs at the bottom of the swing:
                            vmax = √(2gL(1-cos(θ)))
                        </li>
                    </ul>
                    <p>
                        For small angles (less than about 15°), the period is
                        independent of the amplitude. For larger angles, the
                        period increases with amplitude and can be calculated
                        using series approximations or numerical methods.
                    </p>
                </div>
            </div>
        </div>
    );
}
