import React, { useState, useEffect, useRef } from "react";
import { PartyPopper, Play, Pause, RefreshCw, Sliders } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function Projectile() {
    const { theme } = useTheme();
    const [isRunning, setIsRunning] = useState(false);
    const [velocity, setVelocity] = useState(20);
    const [angle, setAngle] = useState(45);
    const [gravity, setGravity] = useState(9.8);
    const [height, setHeight] = useState(0);

    // Animation state
    const [time, setTime] = useState(0);
    const [positions, setPositions] = useState([]);
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const lastTimeRef = useRef(null);

    // Canvas dimensions
    const canvasWidth = 600;
    const canvasHeight = 320;
    const scaleX = 2; // pixels per meter
    const scaleY = 2; // pixels per meter

    // Convert degrees to radians
    const toRadians = (degrees) => degrees * (Math.PI / 180);

    // Reset animation state
    useEffect(() => {
        if (!isRunning) {
            setTime(0);
            calculateTrajectory();
        }
    }, [velocity, angle, gravity, height, isRunning]);

    // Calculate the complete trajectory
    const calculateTrajectory = () => {
        const angleRad = toRadians(angle);
        const vx = velocity * Math.cos(angleRad);
        const vy = velocity * Math.sin(angleRad);

        const trajectoryPoints = [];
        let t = 0;
        let x = 0;
        let y = height;

        // Calculate positions at small time intervals
        while (y >= 0 && t <= 10) {
            // Limit to 10 seconds max
            x = vx * t;
            y = height + vy * t - 0.5 * gravity * t * t;

            if (y >= 0) {
                trajectoryPoints.push({ x, y, t });
            }
            t += 0.05; // Time step
        }

        setPositions(trajectoryPoints);
    };

    // Animation loop
    useEffect(() => {
        if (!isRunning) {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                lastTimeRef.current = null;
                setTime(0);
            }
            return;
        }

        const updateProjectile = (timestamp) => {
            if (lastTimeRef.current === null) {
                lastTimeRef.current = timestamp;
                animationRef.current = requestAnimationFrame(updateProjectile);
                return;
            }

            const deltaTime = (timestamp - lastTimeRef.current) / 1000; // convert to seconds
            lastTimeRef.current = timestamp;

            // Update time with a scaling factor to control animation speed
            const timeIncrement = deltaTime * 0.8; // Adjust this for slower/faster animation
            setTime((prevTime) => {
                const newTime = prevTime + timeIncrement;

                // If we've reached the end of the trajectory, pause the animation
                if (newTime > positions[positions.length - 1]?.t) {
                    setIsRunning(false);
                    return 0;
                }
                return newTime;
            });

            animationRef.current = requestAnimationFrame(updateProjectile);
        };

        animationRef.current = requestAnimationFrame(updateProjectile);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isRunning, positions]);

    // Draw on canvas
    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw grid
        ctx.strokeStyle = theme === "dark" ? "#2e3947" : "#e5e7eb";
        ctx.lineWidth = 1;

        // Vertical grid lines
        for (let i = 0; i <= 10; i++) {
            ctx.beginPath();
            ctx.moveTo(i * 60, 0);
            ctx.lineTo(i * 60, canvas.height);
            ctx.stroke();
        }

        // Horizontal grid lines
        for (let i = 0; i <= 5; i++) {
            ctx.beginPath();
            ctx.moveTo(0, i * 64);
            ctx.lineTo(canvas.width, i * 64);
            ctx.stroke();
        }

        // Draw ground
        ctx.strokeStyle = theme === "dark" ? "#64748b" : "#94a3b8";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height - 10);
        ctx.lineTo(canvas.width, canvas.height - 10);
        ctx.stroke();

        // Draw starting point
        const startY = canvas.height - 10 - height * scaleY;
        ctx.fillStyle = theme === "dark" ? "#a78bfa" : "#6d28d9";
        ctx.beginPath();
        ctx.arc(10, startY, 4, 0, Math.PI * 2);
        ctx.fill();

        // Draw trajectory path
        if (positions.length > 0) {
            ctx.strokeStyle = theme === "dark" ? "#475569" : "#d1d5db";
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 3]);
            ctx.beginPath();

            positions.forEach((pos, index) => {
                const canvasX = 10 + pos.x * scaleX;
                const canvasY = canvas.height - 10 - pos.y * scaleY;

                if (index === 0) {
                    ctx.moveTo(canvasX, canvasY);
                } else {
                    ctx.lineTo(canvasX, canvasY);
                }
            });

            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Draw current projectile position
        if (time > 0 && positions.length > 0) {
            // Find position closest to current time
            const currentPos =
                positions.find((pos) => pos.t >= time) ||
                positions[positions.length - 1];

            if (currentPos) {
                const projX = 10 + currentPos.x * scaleX;
                const projY = canvas.height - 10 - currentPos.y * scaleY;

                // Draw the projectile
                ctx.fillStyle = theme === "dark" ? "#a78bfa" : "#8b5cf6";
                ctx.beginPath();
                ctx.arc(projX, projY, 8, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Draw angle indicator
        if (!isRunning) {
            const angleLineLength = 40;
            const angleRad = toRadians(angle);
            const angleLineX = 10 + Math.cos(angleRad) * angleLineLength;
            const angleLineY = startY - Math.sin(angleRad) * angleLineLength;

            ctx.strokeStyle = theme === "dark" ? "#a78bfa" : "#8b5cf6";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(10, startY);
            ctx.lineTo(angleLineX, angleLineY);
            ctx.stroke();

            // Draw angle arc
            ctx.beginPath();
            ctx.arc(
                10,
                startY,
                20,
                -Math.PI / 2,
                -Math.PI / 2 + angleRad,
                false
            );
            ctx.stroke();

            // Draw angle text
            ctx.fillStyle = theme === "dark" ? "#a78bfa" : "#6d28d9";
            ctx.font = "12px sans-serif";
            ctx.fillText(`${angle}°`, 25, startY - 15);
        }
    }, [theme, time, positions, angle, height, isRunning]);

    // Toggle simulation
    const toggleSimulation = () => {
        setIsRunning(!isRunning);
    };

    // Reset simulation
    const resetSimulation = () => {
        setIsRunning(false);
        setVelocity(20);
        setAngle(45);
        setGravity(9.8);
        setHeight(0);
        setTime(0);
        calculateTrajectory();
    };

    // Calculate key metrics
    const calculateRange = () => {
        const angleRad = toRadians(angle);
        const vx = velocity * Math.cos(angleRad);
        const vy = velocity * Math.sin(angleRad);

        // Time of flight: t = (vy + sqrt(vy^2 + 2*g*h)) / g
        const timeOfFlight =
            (vy + Math.sqrt(vy * vy + 2 * gravity * height)) / gravity;

        // Range = vx * time
        return (vx * timeOfFlight).toFixed(2);
    };

    const calculateMaxHeight = () => {
        const angleRad = toRadians(angle);
        const vy = velocity * Math.sin(angleRad);

        // Max height = h + vy^2/(2g)
        return (height + (vy * vy) / (2 * gravity)).toFixed(2);
    };

    const calculateTimeOfFlight = () => {
        const angleRad = toRadians(angle);
        const vy = velocity * Math.sin(angleRad);

        // Time of flight: t = (vy + sqrt(vy^2 + 2*g*h)) / g
        const timeOfFlight =
            (vy + Math.sqrt(vy * vy + 2 * gravity * height)) / gravity;
        return timeOfFlight.toFixed(2);
    };

    return (
        <div className="pt-16 md:pt-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="flex items-center mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
                <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg mr-3">
                    <PartyPopper className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                        Projectile Motion
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Study the parabolic trajectory of objects in free fall
                    </p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Simulation Controls */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 lg:col-span-1">
                    <div className="flex items-center mb-4">
                        <Sliders className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-2" />
                        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                            Controls
                        </h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Initial Velocity (m/s)
                            </label>
                            <input
                                type="range"
                                min="5"
                                max="50"
                                step="1"
                                value={velocity}
                                onChange={(e) =>
                                    setVelocity(parseFloat(e.target.value))
                                }
                                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                <span>5</span>
                                <span>{velocity}</span>
                                <span>50</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Launch Angle (degrees)
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="90"
                                step="1"
                                value={angle}
                                onChange={(e) =>
                                    setAngle(parseInt(e.target.value))
                                }
                                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                <span>0°</span>
                                <span>{angle}°</span>
                                <span>90°</span>
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
                                Initial Height (m)
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="30"
                                step="1"
                                value={height}
                                onChange={(e) =>
                                    setHeight(parseInt(e.target.value))
                                }
                                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                <span>0</span>
                                <span>{height}</span>
                                <span>30</span>
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
                        <canvas
                            ref={canvasRef}
                            width={canvasWidth}
                            height={canvasHeight}
                        />
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                        <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                            <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                                RANGE
                            </p>
                            <p className="text-lg font-semibold text-orange-800 dark:text-orange-300">
                                {calculateRange()} m
                            </p>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                MAX HEIGHT
                            </p>
                            <p className="text-lg font-semibold text-blue-800 dark:text-blue-300">
                                {calculateMaxHeight()} m
                            </p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                            <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                                FLIGHT TIME
                            </p>
                            <p className="text-lg font-semibold text-green-800 dark:text-green-300">
                                {calculateTimeOfFlight()} s
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
                    <h3>Projectile Motion</h3>
                    <p>
                        Projectile motion is the motion of an object thrown or
                        projected into the air, subject only to the acceleration
                        of gravity. The path followed by a projectile is called
                        its trajectory.
                    </p>
                    <h4>Key Equations:</h4>
                    <ul>
                        <li>Horizontal position: x = (v₀ cos θ)t</li>
                        <li>
                            Vertical position: y = h + (v₀ sin θ)t - (1/2)gt²
                        </li>
                        <li>
                            Range: R = (v₀² sin 2θ)/g + (v₀ cos θ)√(2h/g + (v₀
                            sin θ/g)²)
                        </li>
                        <li>Maximum height: H = h + (v₀ sin θ)²/(2g)</li>
                        <li>
                            Time of flight: t = (v₀ sin θ + √((v₀ sin θ)² +
                            2gh))/g
                        </li>
                    </ul>
                    <p>
                        Where v₀ is the initial velocity, θ is the launch angle,
                        g is the acceleration due to gravity, h is the initial
                        height, and t is time. For objects launched from ground
                        level (h=0), the range is maximized at a launch angle of
                        45°.
                    </p>
                </div>
            </div>
        </div>
    );
}
