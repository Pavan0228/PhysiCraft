import React, { useState, useEffect, useRef } from "react";
import { Music, Play, Pause, RefreshCw, Sliders } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function Harmonic() {
    const { theme } = useTheme();
    const [isRunning, setIsRunning] = useState(false);
    const [frequencyX, setFrequencyX] = useState(1);
    const [frequencyY, setFrequencyY] = useState(2);
    const [phaseShift, setPhaseShift] = useState(90);
    const [amplitude, setAmplitude] = useState(100);
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const pointsRef = useRef([]);
    const timeRef = useRef(0);

    // Toggle simulation
    const toggleSimulation = () => {
        setIsRunning(!isRunning);
    };

    // Reset simulation
    const resetSimulation = () => {
        setIsRunning(false);
        setFrequencyX(1);
        setFrequencyY(2);
        setPhaseShift(90);
        setAmplitude(100);
        pointsRef.current = [];
        timeRef.current = 0;
        drawLissajousCurve();
    };

    // Draw the Lissajous curve
    const drawLissajousCurve = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.fillStyle = theme === "dark" ? "#0f172a" : "#f1f5f9";
        ctx.fillRect(0, 0, width, height);

        // Draw grid lines
        ctx.strokeStyle = theme === "dark" ? "#2e3947" : "#e5e7eb";
        ctx.lineWidth = 1;

        // Vertical lines
        for (let i = 0; i <= 10; i++) {
            ctx.beginPath();
            ctx.moveTo(i * (width / 10), 0);
            ctx.lineTo(i * (width / 10), height);
            ctx.stroke();
        }

        // Horizontal lines
        for (let i = 0; i <= 10; i++) {
            ctx.beginPath();
            ctx.moveTo(0, i * (height / 10));
            ctx.lineTo(width, i * (height / 10));
            ctx.stroke();
        }

        // Draw axes
        ctx.strokeStyle = theme === "dark" ? "#475569" : "#94a3b8";
        ctx.lineWidth = 2;

        // X-axis
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();

        // Y-axis
        ctx.beginPath();
        ctx.moveTo(width / 2, 0);
        ctx.lineTo(width / 2, height);
        ctx.stroke();

        // Draw Lissajous curve
        ctx.strokeStyle = theme === "dark" ? "#a78bfa" : "#8b5cf6"; // Purple
        ctx.lineWidth = 2;

        const phaseInRadians = (phaseShift * Math.PI) / 180;
        const centerX = width / 2;
        const centerY = height / 2;

        // Formula: x = A * sin(a*t + δ), y = A * sin(b*t)
        if (!isRunning) {
            // Draw full curve at once when not animating
            ctx.beginPath();
            for (let t = 0; t <= 2 * Math.PI; t += 0.01) {
                const x =
                    centerX +
                    amplitude * Math.sin(frequencyX * t + phaseInRadians);
                const y = centerY - amplitude * Math.sin(frequencyY * t);

                if (t === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();
        } else {
            // Draw only the points collected so far when animating
            if (pointsRef.current.length > 1) {
                ctx.beginPath();
                ctx.moveTo(pointsRef.current[0].x, pointsRef.current[0].y);

                for (let i = 1; i < pointsRef.current.length; i++) {
                    ctx.lineTo(pointsRef.current[i].x, pointsRef.current[i].y);
                }
                ctx.stroke();
            }

            // Draw the current point
            const t = timeRef.current;
            const x =
                centerX + amplitude * Math.sin(frequencyX * t + phaseInRadians);
            const y = centerY - amplitude * Math.sin(frequencyY * t);

            ctx.fillStyle = theme === "dark" ? "#c4b5fd" : "#7c3aed";
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, 2 * Math.PI);
            ctx.fill();
        }
    };

    // Animation loop
    useEffect(() => {
        if (!isRunning) {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            drawLissajousCurve();
            return;
        }

        pointsRef.current = [];
        timeRef.current = 0;

        const animate = () => {
            timeRef.current += 0.02;

            // Calculate current point
            const canvas = canvasRef.current;
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const phaseInRadians = (phaseShift * Math.PI) / 180;

            const x =
                centerX +
                amplitude *
                    Math.sin(frequencyX * timeRef.current + phaseInRadians);
            const y =
                centerY - amplitude * Math.sin(frequencyY * timeRef.current);

            // Add to points array
            pointsRef.current.push({ x, y });

            // Limit points to avoid performance issues
            if (pointsRef.current.length > 1000) {
                pointsRef.current.shift();
            }

            // If we've completed a cycle based on the frequencies (approximately)
            if (timeRef.current >= 2 * Math.PI * 10) {
                timeRef.current = 0;
                pointsRef.current = [];
            }

            drawLissajousCurve();
            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isRunning, frequencyX, frequencyY, phaseShift, amplitude, theme]);

    // Initial render and when parameters change but simulation is not running
    useEffect(() => {
        if (!isRunning) {
            drawLissajousCurve();
        }
    }, [frequencyX, frequencyY, phaseShift, amplitude, theme, isRunning]);

    // Calculate the ratio for display
    const gcd = (a, b) => {
        a = Math.abs(a);
        b = Math.abs(b);
        return b === 0 ? a : gcd(b, a % b);
    };

    const frequencyRatio = () => {
        if (frequencyX === 0 || frequencyY === 0) return "1:1";
        const divisor = gcd(frequencyX * 10, frequencyY * 10);
        return `${(frequencyX * 10) / divisor}:${(frequencyY * 10) / divisor}`;
    };

    return (
        <div className="pt-16 md:pt-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="flex items-center mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg mr-3">
                    <Music className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                        Lissajous Curves
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Visualize harmonic motion and phase relationships
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
                                X-Axis Frequency
                            </label>
                            <input
                                type="range"
                                min="0.1"
                                max="5"
                                step="0.1"
                                value={frequencyX}
                                onChange={(e) =>
                                    setFrequencyX(parseFloat(e.target.value))
                                }
                                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                <span>0.1</span>
                                <span>{frequencyX.toFixed(1)}</span>
                                <span>5.0</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Y-Axis Frequency
                            </label>
                            <input
                                type="range"
                                min="0.1"
                                max="5"
                                step="0.1"
                                value={frequencyY}
                                onChange={(e) =>
                                    setFrequencyY(parseFloat(e.target.value))
                                }
                                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                <span>0.1</span>
                                <span>{frequencyY.toFixed(1)}</span>
                                <span>5.0</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Phase Shift (degrees)
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="360"
                                step="1"
                                value={phaseShift}
                                onChange={(e) =>
                                    setPhaseShift(parseInt(e.target.value))
                                }
                                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                <span>0°</span>
                                <span>{phaseShift}°</span>
                                <span>360°</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Amplitude
                            </label>
                            <input
                                type="range"
                                min="20"
                                max="150"
                                step="1"
                                value={amplitude}
                                onChange={(e) =>
                                    setAmplitude(parseInt(e.target.value))
                                }
                                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                <span>20</span>
                                <span>{amplitude}</span>
                                <span>150</span>
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
                                        <Play className="w-4 h-4 mr-1" />{" "}
                                        Animate
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
                                FREQUENCY RATIO
                            </p>
                            <p className="text-lg font-semibold text-purple-800 dark:text-purple-300">
                                {frequencyRatio()}
                            </p>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                PHASE SHIFT
                            </p>
                            <p className="text-lg font-semibold text-blue-800 dark:text-blue-300">
                                {phaseShift}°
                            </p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                            <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                                AMPLITUDE
                            </p>
                            <p className="text-lg font-semibold text-green-800 dark:text-green-300">
                                {amplitude}
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
                    <h3>Lissajous Curves</h3>
                    <p>
                        Lissajous curves (also known as Lissajous figures or
                        Bowditch curves) are the graph of a system of parametric
                        equations that describe complex harmonic motion:
                    </p>
                    <p className="font-mono">
                        x = A sin(at + δ)
                        <br />y = B sin(bt)
                    </p>
                    <p>Where:</p>
                    <ul>
                        <li>A and B are the amplitudes of the motion</li>
                        <li>a and b are the angular frequencies</li>
                        <li>δ is the phase shift between the curves</li>
                    </ul>
                    <h4>Properties:</h4>
                    <ul>
                        <li>When a/b is rational, the curve is closed</li>
                        <li>
                            The ratio a:b determines the number of lobes in the
                            figure
                        </li>
                        <li>
                            The phase shift δ determines the shape and
                            orientation
                        </li>
                        <li>When a = b and δ = 90°, the figure is a circle</li>
                        <li>When a = b and δ = 0°, the figure is a line</li>
                    </ul>
                    <p>
                        Lissajous curves are widely used in physics and
                        engineering to visualize phase relationships, study
                        harmonic oscillations, and analyze signal frequencies in
                        oscilloscopes. By varying the three parameters above, a
                        rich variety of patterns can be created.
                    </p>
                </div>
            </div>
        </div>
    );
}
