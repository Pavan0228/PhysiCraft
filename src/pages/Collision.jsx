import React, { useState, useEffect, useRef } from "react";
import {
    CircleOff,
    Play,
    Pause,
    RefreshCw,
    Sliders,
    ToggleLeft,
    ToggleRight,
    LineChart,
    Info,
    Battery,
    Gauge,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function CollisionPage() {
    const { theme } = useTheme();
    const [isRunning, setIsRunning] = useState(false);
    const [hasAirResistance, setHasAirResistance] = useState(false);

    // Object 1 properties
    const [mass1, setMass1] = useState(10);
    const [velocity1, setVelocity1] = useState(2);
    const [position1, setPosition1] = useState(150);

    // Object 2 properties
    const [mass2, setMass2] = useState(10);
    const [velocity2, setVelocity2] = useState(-2);
    const [position2, setPosition2] = useState(450);

    // Physics properties
    const [elasticity, setElasticity] = useState(0.9); // 1 = perfectly elastic, 0 = inelastic
    const [friction, setFriction] = useState(0.02); // air resistance coefficient

    // Energy and velocity tracking
    const [initialEnergy, setInitialEnergy] = useState(0);
    const [currentEnergy, setCurrentEnergy] = useState(0);
    const [energyLoss, setEnergyLoss] = useState(0);
    const [maxVelocity1, setMaxVelocity1] = useState(0);
    const [maxVelocity2, setMaxVelocity2] = useState(0);
    const [showEnergyGraph, setShowEnergyGraph] = useState(false);
    const [energyData, setEnergyData] = useState([]);

    // Terminal velocity calculations
    const [terminalVelocity1, setTerminalVelocity1] = useState(0);
    const [terminalVelocity2, setTerminalVelocity2] = useState(0);
    const [showEnergyStats, setShowEnergyStats] = useState(false);

    // Animation state
    const animationRef = useRef(null);
    const lastTimeRef = useRef(null);
    const canvasRef = useRef(null);
    const currentVelocity1 = useRef(velocity1);
    const currentVelocity2 = useRef(velocity2);
    const currentPosition1 = useRef(position1);
    const currentPosition2 = useRef(position2);

    // Constants
    const objectRadius1 = 15 + mass1 / 2;
    const objectRadius2 = 15 + mass2 / 2;
    const canvasWidth = 600;
    const canvasHeight = 320;

    // Initialize simulation
    useEffect(() => {
        if (!isRunning) {
            currentVelocity1.current = velocity1;
            currentVelocity2.current = velocity2;
            currentPosition1.current = position1;
            currentPosition2.current = position2;

            // Calculate and store the initial energy
            const initialEnergyValue =
                0.5 * mass1 * Math.pow(velocity1, 2) +
                0.5 * mass2 * Math.pow(velocity2, 2);
            setInitialEnergy(initialEnergyValue);
            setCurrentEnergy(initialEnergyValue);
            setEnergyLoss(0);
            setEnergyData([{ time: 0, energy: initialEnergyValue }]);

            // Calculate terminal velocities
            if (hasAirResistance && friction > 0) {
                // Terminal velocity formula: v_t = sqrt(mg/k), where k is the drag coefficient
                const termV1 = Math.sqrt((mass1 * 9.8) / friction);
                const termV2 = Math.sqrt((mass2 * 9.8) / friction);
                setTerminalVelocity1(termV1);
                setTerminalVelocity2(termV2);
            }

            // Reset max velocities
            setMaxVelocity1(Math.abs(velocity1));
            setMaxVelocity2(Math.abs(velocity2));

            drawScene();
        }
    }, [
        position1,
        position2,
        velocity1,
        velocity2,
        mass1,
        mass2,
        isRunning,
        friction,
        hasAirResistance,
    ]);

    // Handle collision physics
    const handleCollision = () => {
        // Calculate new velocities using conservation of momentum and energy
        const m1 = mass1;
        const m2 = mass2;
        const v1 = currentVelocity1.current;
        const v2 = currentVelocity2.current;

        // Elastic collision formula
        const newV1 =
            (v1 * (m1 - elasticity * m2)) / (m1 + m2) +
            (v2 * (1 + elasticity) * m2) / (m1 + m2);
        const newV2 =
            (v1 * (1 + elasticity) * m1) / (m1 + m2) +
            (v2 * (m2 - elasticity * m1)) / (m1 + m2);

        currentVelocity1.current = newV1;
        currentVelocity2.current = newV2;
    };

    // Animation loop
    useEffect(() => {
        if (!isRunning) {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                lastTimeRef.current = null;
            }
            return;
        }

        let startTime = null;

        const updateSimulation = (time) => {
            if (lastTimeRef.current === null) {
                lastTimeRef.current = time;
                startTime = time;
                animationRef.current = requestAnimationFrame(updateSimulation);
                return;
            }

            const deltaTime = (time - lastTimeRef.current) / 1000; // convert to seconds
            const elapsedTime = (time - startTime) / 1000;
            lastTimeRef.current = time;

            // Apply air resistance if enabled
            if (hasAirResistance) {
                currentVelocity1.current -=
                    Math.sign(currentVelocity1.current) *
                    friction *
                    Math.pow(currentVelocity1.current, 2) *
                    deltaTime;
                currentVelocity2.current -=
                    Math.sign(currentVelocity2.current) *
                    friction *
                    Math.pow(currentVelocity2.current, 2) *
                    deltaTime;
            }

            // Update positions
            currentPosition1.current +=
                currentVelocity1.current * 100 * deltaTime;
            currentPosition2.current +=
                currentVelocity2.current * 100 * deltaTime;

            // Update max velocities
            if (Math.abs(currentVelocity1.current) > maxVelocity1) {
                setMaxVelocity1(Math.abs(currentVelocity1.current));
            }
            if (Math.abs(currentVelocity2.current) > maxVelocity2) {
                setMaxVelocity2(Math.abs(currentVelocity2.current));
            }

            // Calculate current energy and energy loss
            const currentEnergyValue =
                0.5 * mass1 * Math.pow(currentVelocity1.current, 2) +
                0.5 * mass2 * Math.pow(currentVelocity2.current, 2);
            setCurrentEnergy(currentEnergyValue);

            const energyLossValue = initialEnergy - currentEnergyValue;
            setEnergyLoss(energyLossValue);

            // Update energy data for graph (limit to 100 data points)
            setEnergyData((prevData) => {
                const newData = [
                    ...prevData,
                    { time: elapsedTime, energy: currentEnergyValue },
                ];
                if (newData.length > 100) {
                    return newData.slice(newData.length - 100);
                }
                return newData;
            });

            // Check for collision between objects
            const distance = Math.abs(
                currentPosition2.current - currentPosition1.current
            );
            if (
                distance <= objectRadius1 + objectRadius2 &&
                ((currentVelocity1.current > currentVelocity2.current &&
                    currentPosition1.current < currentPosition2.current) ||
                    (currentVelocity2.current > currentVelocity1.current &&
                        currentPosition2.current < currentPosition1.current))
            ) {
                // Position correction to prevent overlap
                const overlap = objectRadius1 + objectRadius2 - distance;
                const totalMass = mass1 + mass2;
                currentPosition1.current -=
                    overlap *
                    (mass2 / totalMass) *
                    Math.sign(
                        currentPosition2.current - currentPosition1.current
                    );
                currentPosition2.current +=
                    overlap *
                    (mass1 / totalMass) *
                    Math.sign(
                        currentPosition2.current - currentPosition1.current
                    );

                // Handle collision physics
                handleCollision();
            }

            // Check for wall collisions
            if (currentPosition1.current - objectRadius1 <= 0) {
                currentPosition1.current = objectRadius1;
                currentVelocity1.current =
                    -currentVelocity1.current * elasticity;
            }

            if (currentPosition1.current + objectRadius1 >= canvasWidth) {
                currentPosition1.current = canvasWidth - objectRadius1;
                currentVelocity1.current =
                    -currentVelocity1.current * elasticity;
            }

            if (currentPosition2.current - objectRadius2 <= 0) {
                currentPosition2.current = objectRadius2;
                currentVelocity2.current =
                    -currentVelocity2.current * elasticity;
            }

            if (currentPosition2.current + objectRadius2 >= canvasWidth) {
                currentPosition2.current = canvasWidth - objectRadius2;
                currentVelocity2.current =
                    -currentVelocity2.current * elasticity;
            }

            // Draw the scene
            drawScene();

            animationRef.current = requestAnimationFrame(updateSimulation);
        };

        animationRef.current = requestAnimationFrame(updateSimulation);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                lastTimeRef.current = null;
            }
        };
    }, [
        isRunning,
        mass1,
        mass2,
        elasticity,
        friction,
        hasAirResistance,
        initialEnergy,
        maxVelocity1,
        maxVelocity2,
    ]);

    // Drawing function
    const drawScene = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Background
        ctx.fillStyle = theme === "dark" ? "#0f172a" : "#f1f5f9";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Grid lines
        ctx.strokeStyle = theme === "dark" ? "#2e3947" : "#e5e7eb";
        ctx.lineWidth = 1;

        // Vertical lines
        for (let i = 0; i <= 10; i++) {
            ctx.beginPath();
            ctx.moveTo(i * (canvas.width / 10), 0);
            ctx.lineTo(i * (canvas.width / 10), canvas.height);
            ctx.stroke();
        }

        // Horizontal lines
        for (let i = 0; i <= 5; i++) {
            ctx.beginPath();
            ctx.moveTo(0, i * (canvas.height / 5));
            ctx.lineTo(canvas.width, i * (canvas.height / 5));
            ctx.stroke();
        }

        // Draw floor
        ctx.strokeStyle = theme === "dark" ? "#475569" : "#94a3b8";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height - 20);
        ctx.lineTo(canvas.width, canvas.height - 20);
        ctx.stroke();

        // Draw objects
        const y = canvas.height - 20 - objectRadius1;

        // Draw object 1
        ctx.fillStyle = theme === "dark" ? "#a78bfa" : "#8b5cf6"; // Purple
        ctx.beginPath();
        ctx.arc(currentPosition1.current, y, objectRadius1, 0, Math.PI * 2);
        ctx.fill();

        // Label for mass 1
        ctx.fillStyle = theme === "dark" ? "#f1f5f9" : "#1f2937";
        ctx.font = "12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`m₁`, currentPosition1.current, y + 4);

        // Velocity vector for object 1
        if (currentVelocity1.current !== 0) {
            const velocityScale = 10;
            const arrowLength = currentVelocity1.current * velocityScale;
            const arrowX = currentPosition1.current + arrowLength;

            ctx.strokeStyle = theme === "dark" ? "#34d399" : "#10b981";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(currentPosition1.current, y - objectRadius1 - 10);
            ctx.lineTo(arrowX, y - objectRadius1 - 10);

            // Arrow head
            if (currentVelocity1.current > 0) {
                ctx.lineTo(arrowX - 5, y - objectRadius1 - 15);
                ctx.moveTo(arrowX, y - objectRadius1 - 10);
                ctx.lineTo(arrowX - 5, y - objectRadius1 - 5);
            } else {
                ctx.lineTo(arrowX + 5, y - objectRadius1 - 15);
                ctx.moveTo(arrowX, y - objectRadius1 - 10);
                ctx.lineTo(arrowX + 5, y - objectRadius1 - 5);
            }
            ctx.stroke();
        }

        // Draw object 2
        ctx.fillStyle = theme === "dark" ? "#60a5fa" : "#3b82f6"; // Blue
        ctx.beginPath();
        ctx.arc(currentPosition2.current, y, objectRadius2, 0, Math.PI * 2);
        ctx.fill();

        // Label for mass 2
        ctx.fillStyle = theme === "dark" ? "#f1f5f9" : "#1f2937";
        ctx.font = "12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`m₂`, currentPosition2.current, y + 4);

        // Velocity vector for object 2
        if (currentVelocity2.current !== 0) {
            const velocityScale = 10;
            const arrowLength = currentVelocity2.current * velocityScale;
            const arrowX = currentPosition2.current + arrowLength;

            ctx.strokeStyle = theme === "dark" ? "#34d399" : "#10b981";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(currentPosition2.current, y - objectRadius2 - 10);
            ctx.lineTo(arrowX, y - objectRadius2 - 10);

            // Arrow head
            if (currentVelocity2.current > 0) {
                ctx.lineTo(arrowX - 5, y - objectRadius2 - 15);
                ctx.moveTo(arrowX, y - objectRadius2 - 10);
                ctx.lineTo(arrowX - 5, y - objectRadius2 - 5);
            } else {
                ctx.lineTo(arrowX + 5, y - objectRadius2 - 15);
                ctx.moveTo(arrowX, y - objectRadius2 - 10);
                ctx.lineTo(arrowX + 5, y - objectRadius2 - 5);
            }
            ctx.stroke();
        }

        // If air resistance is enabled, draw air particles
        if (hasAirResistance) {
            ctx.fillStyle =
                theme === "dark"
                    ? "rgba(255, 255, 255, 0.2)"
                    : "rgba(0, 0, 0, 0.1)";
            for (let i = 0; i < 50; i++) {
                const x = Math.random() * canvas.width;
                const particleY = Math.random() * (canvas.height - 20);
                const size = Math.random() * 2 + 1;
                ctx.beginPath();
                ctx.arc(x, particleY, size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    };

    // Toggle simulation
    const toggleSimulation = () => {
        setIsRunning(!isRunning);
    };

    // Toggle air resistance
    const toggleAirResistance = () => {
        setHasAirResistance(!hasAirResistance);
    };

    // Reset simulation
    const resetSimulation = () => {
        setIsRunning(false);
        setMass1(10);
        setMass2(10);
        setVelocity1(2);
        setVelocity2(-2);
        setPosition1(150);
        setPosition2(450);
        setElasticity(0.9);
        currentVelocity1.current = 2;
        currentVelocity2.current = -2;
        currentPosition1.current = 150;
        currentPosition2.current = 450;
    };

    // Calculate total momentum
    const calculateTotalMomentum = () => {
        return Math.abs(
            mass1 * currentVelocity1.current + mass2 * currentVelocity2.current
        ).toFixed(2);
    };

    // Calculate total kinetic energy
    const calculateTotalEnergy = () => {
        return (
            0.5 * mass1 * Math.pow(currentVelocity1.current, 2) +
            0.5 * mass2 * Math.pow(currentVelocity2.current, 2)
        ).toFixed(2);
    };

    // Calculate relative velocity
    const calculateRelativeVelocity = () => {
        return Math.abs(
            currentVelocity1.current - currentVelocity2.current
        ).toFixed(2);
    };

    return (
        <div className="pt-16 md:pt-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="flex items-center mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg mr-3">
                    <CircleOff className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                        Collision Simulation
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Study elastic and inelastic collisions between objects
                    </p>
                </div>
            </div>

            {/* Main Layout - Grid with Controls, Simulation, and Energy Statistics side by side */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
                {/* Simulation Controls */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 lg:col-span-3">
                    <div className="flex items-center mb-4">
                        <Sliders className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
                        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                            Controls
                        </h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Air Resistance
                            </span>
                            <button
                                onClick={toggleAirResistance}
                                className={`flex items-center px-3 py-1.5 rounded-md text-xs font-medium ${
                                    hasAirResistance
                                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                        : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                                }`}
                            >
                                {hasAirResistance ? (
                                    <>
                                        <ToggleRight className="w-4 h-4 mr-1.5" />
                                        Enabled
                                    </>
                                ) : (
                                    <>
                                        <ToggleLeft className="w-4 h-4 mr-1.5" />
                                        Disabled
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-gray-700">
                            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-2">
                                Object 1 (Purple)
                            </h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Mass (kg)
                                </label>
                                <input
                                    type="range"
                                    min="1"
                                    max="20"
                                    step="1"
                                    value={mass1}
                                    onChange={(e) => {
                                        setMass1(parseInt(e.target.value));
                                    }}
                                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    <span>1</span>
                                    <span>{mass1}</span>
                                    <span>20</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Initial Velocity (m/s)
                                </label>
                                <input
                                    type="range"
                                    min="-5"
                                    max="5"
                                    step="0.5"
                                    value={velocity1}
                                    onChange={(e) => {
                                        setVelocity1(
                                            parseFloat(e.target.value)
                                        );
                                        if (!isRunning) {
                                            currentVelocity1.current =
                                                parseFloat(e.target.value);
                                        }
                                    }}
                                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    <span>-5.0</span>
                                    <span>{velocity1.toFixed(1)}</span>
                                    <span>5.0</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Initial Position
                                </label>
                                <input
                                    type="range"
                                    min={objectRadius1}
                                    max={canvasWidth / 2 - objectRadius1}
                                    step="1"
                                    value={position1}
                                    onChange={(e) => {
                                        setPosition1(parseInt(e.target.value));
                                        if (!isRunning) {
                                            currentPosition1.current = parseInt(
                                                e.target.value
                                            );
                                        }
                                    }}
                                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                    disabled={isRunning}
                                />
                                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    <span>Left</span>
                                    <span>
                                        {isRunning ? "Running..." : position1}
                                    </span>
                                    <span>Center</span>
                                </div>
                            </div>

                            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                                Object 2 (Blue)
                            </h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Mass (kg)
                                </label>
                                <input
                                    type="range"
                                    min="1"
                                    max="20"
                                    step="1"
                                    value={mass2}
                                    onChange={(e) => {
                                        setMass2(parseInt(e.target.value));
                                    }}
                                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    <span>1</span>
                                    <span>{mass2}</span>
                                    <span>20</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Initial Velocity (m/s)
                                </label>
                                <input
                                    type="range"
                                    min="-5"
                                    max="5"
                                    step="0.5"
                                    value={velocity2}
                                    onChange={(e) => {
                                        setVelocity2(
                                            parseFloat(e.target.value)
                                        );
                                        if (!isRunning) {
                                            currentVelocity2.current =
                                                parseFloat(e.target.value);
                                        }
                                    }}
                                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    <span>-5.0</span>
                                    <span>{velocity2.toFixed(1)}</span>
                                    <span>5.0</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Initial Position
                                </label>
                                <input
                                    type="range"
                                    min={canvasWidth / 2 + objectRadius2}
                                    max={canvasWidth - objectRadius2}
                                    step="1"
                                    value={position2}
                                    onChange={(e) => {
                                        setPosition2(parseInt(e.target.value));
                                        if (!isRunning) {
                                            currentPosition2.current = parseInt(
                                                e.target.value
                                            );
                                        }
                                    }}
                                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                    disabled={isRunning}
                                />
                                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    <span>Center</span>
                                    <span>
                                        {isRunning ? "Running..." : position2}
                                    </span>
                                    <span>Right</span>
                                </div>
                            </div>

                            <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Elasticity (0 = Inelastic, 1 = Elastic)
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={elasticity}
                                    onChange={(e) => {
                                        setElasticity(
                                            parseFloat(e.target.value)
                                        );
                                    }}
                                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    <span>Inelastic</span>
                                    <span>{elasticity.toFixed(1)}</span>
                                    <span>Elastic</span>
                                </div>
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

                <div className="lg:col-span-9 space-y-6">
                    {/* Simulation View */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">
                            Simulation
                        </h2>
                        <div className="bg-gray-100 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <canvas
                                ref={canvasRef}
                                width={600}
                                height={320}
                                className="w-full h-80"
                            ></canvas>
                        </div>

                        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                                    MOMENTUM
                                </p>
                                <p className="text-lg font-semibold text-purple-800 dark:text-purple-300">
                                    {calculateTotalMomentum()} kg·m/s
                                </p>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                    ENERGY
                                </p>
                                <p className="text-lg font-semibold text-blue-800 dark:text-blue-300">
                                    {calculateTotalEnergy()} J
                                </p>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                                <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                                    RELATIVE VELOCITY
                                </p>
                                <p className="text-lg font-semibold text-green-800 dark:text-green-300">
                                    {calculateRelativeVelocity()} m/s
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Energy Statistics - Now directly under simulation without need for scrolling */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <Battery className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-2" />
                                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                                    Energy Statistics
                                </h2>
                            </div>
                            <button
                                onClick={() =>
                                    setShowEnergyStats(!showEnergyStats)
                                }
                                className="text-sm flex items-center px-3 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                            >
                                {showEnergyStats
                                    ? "Hide Details"
                                    : "Show Details"}
                            </button>
                        </div>

                        <div className="grid gap-4 grid-cols-1 md:grid-cols-3 mb-4">
                            <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-4 rounded-lg">
                                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                    INITIAL ENERGY
                                </p>
                                <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">
                                    {initialEnergy.toFixed(2)} J
                                </p>
                                <div className="mt-1 h-1 w-full bg-blue-200 dark:bg-blue-700 rounded"></div>
                            </div>

                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg">
                                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                                    CURRENT ENERGY
                                </p>
                                <p className="text-2xl font-bold text-purple-800 dark:text-purple-300">
                                    {currentEnergy.toFixed(2)} J
                                </p>
                                <div className="mt-1 h-1 w-full bg-purple-200 dark:bg-purple-700 rounded">
                                    <div
                                        className="h-1 bg-purple-500 dark:bg-purple-400 rounded"
                                        style={{
                                            width: `${
                                                (currentEnergy /
                                                    initialEnergy) *
                                                100
                                            }%`,
                                        }}
                                    ></div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-amber-50 to-red-50 dark:from-amber-900/20 dark:to-red-900/20 p-4 rounded-lg">
                                <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                                    ENERGY LOSS
                                </p>
                                <p className="text-2xl font-bold text-red-800 dark:text-red-300">
                                    {energyLoss.toFixed(2)} J
                                </p>
                                <div className="mt-1 h-1 w-full bg-red-200 dark:bg-red-700 rounded">
                                    <div
                                        className="h-1 bg-red-500 dark:bg-red-400 rounded"
                                        style={{
                                            width: `${
                                                (energyLoss / initialEnergy) *
                                                100
                                            }%`,
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        {showEnergyStats && (
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
                                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                                        Velocity Statistics
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-white dark:bg-slate-800 p-3 rounded-md border border-slate-100 dark:border-slate-700">
                                            <div className="flex justify-between mb-1">
                                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                                    Object 1 Max
                                                </span>
                                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                    {maxVelocity1.toFixed(2)}{" "}
                                                    m/s
                                                </span>
                                            </div>
                                            {hasAirResistance &&
                                                terminalVelocity1 > 0 && (
                                                    <div className="flex justify-between">
                                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                                            Terminal Vel.
                                                        </span>
                                                        <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                                                            {terminalVelocity1.toFixed(
                                                                2
                                                            )}{" "}
                                                            m/s
                                                        </span>
                                                    </div>
                                                )}
                                        </div>

                                        <div className="bg-white dark:bg-slate-800 p-3 rounded-md border border-slate-100 dark:border-slate-700">
                                            <div className="flex justify-between mb-1">
                                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                                    Object 2 Max
                                                </span>
                                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                    {maxVelocity2.toFixed(2)}{" "}
                                                    m/s
                                                </span>
                                            </div>
                                            {hasAirResistance &&
                                                terminalVelocity2 > 0 && (
                                                    <div className="flex justify-between">
                                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                                            Terminal Vel.
                                                        </span>
                                                        <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                                                            {terminalVelocity2.toFixed(
                                                                2
                                                            )}{" "}
                                                            m/s
                                                        </span>
                                                    </div>
                                                )}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
                                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                                        Air Resistance Effects
                                    </h3>
                                    {hasAirResistance ? (
                                        <div className="space-y-2">
                                            <div className="flex items-center py-2">
                                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                                                    <div
                                                        className="bg-gradient-to-r from-green-500 to-red-500 h-2.5 rounded-full"
                                                        style={{
                                                            width: `${
                                                                (energyLoss /
                                                                    initialEnergy) *
                                                                100
                                                            }%`,
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                                                <span>
                                                    Energy Remaining:{" "}
                                                    {(
                                                        (1 -
                                                            energyLoss /
                                                                initialEnergy) *
                                                        100
                                                    ).toFixed(0)}
                                                    %
                                                </span>
                                                <span>
                                                    Loss Rate:{" "}
                                                    {hasAirResistance
                                                        ? "~" +
                                                          (
                                                              friction * 100
                                                          ).toFixed(2) +
                                                          "%"
                                                        : "0%"}
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center h-20 border border-dashed border-slate-200 dark:border-slate-700 rounded-md">
                                            <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                                                Enable air resistance to see
                                                energy loss effects
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {hasAirResistance && (
                                    <div className="md:col-span-2 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                Energy Over Time
                                            </h3>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center">
                                                    <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                                                    <span className="text-xs text-slate-600 dark:text-slate-400">
                                                        Energy
                                                    </span>
                                                </div>
                                                <div className="flex items-center">
                                                    <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                                                    <span className="text-xs text-slate-600 dark:text-slate-400">
                                                        Loss
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="relative h-28 bg-white dark:bg-slate-800 rounded-md border border-slate-100 dark:border-slate-700 p-1">
                                            <div className="w-full h-full flex items-end">
                                                {energyData.map(
                                                    (point, index) => {
                                                        const ratio =
                                                            point.energy /
                                                            initialEnergy;
                                                        const height = Math.max(
                                                            ratio * 100,
                                                            3
                                                        );
                                                        return (
                                                            <div
                                                                key={index}
                                                                className="flex-1 mx-px"
                                                                style={{
                                                                    height: `${height}%`,
                                                                    backgroundColor: `rgba(59, 130, 246, ${ratio})`,
                                                                    opacity:
                                                                        index /
                                                                        energyData.length,
                                                                }}
                                                            ></div>
                                                        );
                                                    }
                                                )}
                                            </div>
                                            <div
                                                className="absolute top-0 left-0 right-0 h-px bg-red-400 opacity-50"
                                                style={{
                                                    top: `${
                                                        100 -
                                                        ((initialEnergy -
                                                            energyLoss) /
                                                            initialEnergy) *
                                                            100
                                                    }%`,
                                                }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between mt-1 text-xs text-slate-500 dark:text-slate-400">
                                            <span>Start</span>
                                            <span>Time</span>
                                            <span>Now</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Theory Section - Moved to bottom */}
            <div className="mt-6 bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">
                    Theory
                </h2>
                <div className="prose dark:prose-invert max-w-none">
                    <h3>Collision Physics</h3>
                    <p>
                        Collisions involve the interaction of two or more
                        objects that exert forces on each other for a relatively
                        short time. They can be classified as elastic,
                        inelastic, or completely inelastic.
                    </p>
                    <h4>Conservation Laws:</h4>
                    <ul>
                        <li>
                            <strong>Conservation of Momentum:</strong> The total
                            momentum of a closed system remains constant: m₁v₁ +
                            m₂v₂ = m₁v₁' + m₂v₂'
                        </li>
                        <li>
                            <strong>Conservation of Energy:</strong> In elastic
                            collisions, kinetic energy is conserved: ½m₁v₁² +
                            ½m₂v₂² = ½m₁v₁'² + ½m₂v₂'²
                        </li>
                    </ul>

                    <h4>Types of Collisions:</h4>
                    <ul>
                        <li>
                            <strong>Elastic Collision (e = 1):</strong> Both
                            momentum and kinetic energy are conserved. Ideal
                            case where no energy is converted to heat, sound, or
                            deformation.
                        </li>
                        <li>
                            <strong>
                                Inelastic Collision (0 &lt; e &lt; 1):
                            </strong>{" "}
                            Momentum is conserved, but some kinetic energy is
                            lost. Common in real-world situations.
                        </li>
                        <li>
                            <strong>
                                Completely Inelastic Collision (e = 0):
                            </strong>{" "}
                            Objects stick together after collision, resulting in
                            maximum energy loss.
                        </li>
                    </ul>

                    <h4>Air Resistance Effects:</h4>
                    <p>
                        Air resistance (drag) opposes the motion of objects and
                        is proportional to the square of velocity. It causes a
                        gradual decrease in velocity and kinetic energy,
                        converting mechanical energy to thermal energy.
                    </p>
                </div>
            </div>
        </div>
    );
}
