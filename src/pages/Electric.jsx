import React, { useRef, useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import {
    Zap,
    Play,
    Pause,
    RefreshCw,
    Sliders,
    ToggleLeft,
    ToggleRight,
    Magnet,
    Plus,
    Minus,
    MousePointer,
    Move,
    Layers,
    Info,
} from "lucide-react";

function Electric() {
    const { theme } = useTheme();
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const [isRunning, setIsRunning] = useState(false);
    const [showMagneticField, setShowMagneticField] = useState(true);
    const [showElectricField, setShowElectricField] = useState(true);
    const [showFieldLines, setShowFieldLines] = useState(true);
    const [chargeStrength, setChargeStrength] = useState(5);
    const [currentStrength, setCurrentStrength] = useState(5);
    const [interactionMode, setInteractionMode] = useState("move"); // 'move', 'add_positive', 'add_negative', 'add_current'

    // Animation properties
    const [animationTime, setAnimationTime] = useState(0);
    const [animationSpeed, setAnimationSpeed] = useState(1);

    // Charges and currents
    const [charges, setCharges] = useState([
        { x: 150, y: 160, charge: 5, id: 1 }, // positive charge
        { x: 450, y: 160, charge: -5, id: 2 }, // negative charge
    ]);

    const [currentLoops, setCurrentLoops] = useState([
        { x: 300, y: 160, radius: 50, current: 5, id: 1 }, // clockwise current
    ]);

    const [selectedEntity, setSelectedEntity] = useState(null);
    const [showHelp, setShowHelp] = useState(false);

    // Constants for visualization
    const fieldStrength = 10;
    const fieldDensity = 20; // Points per row/column
    const canvasWidth = 600;
    const canvasHeight = 320;

    // Initialize visualization
    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            // Set correct canvas dimensions to avoid scaling issues
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;
            drawScene();
        }
    }, [
        charges,
        currentLoops,
        showElectricField,
        showMagneticField,
        showFieldLines,
        fieldStrength,
        theme,
        animationTime,
    ]);

    // Animation loop
    useEffect(() => {
        if (!isRunning) {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            return;
        }

        const animate = () => {
            setAnimationTime((prevTime) => prevTime + 0.03 * animationSpeed);

            // Animate current loops rotation
            setCurrentLoops((prevLoops) =>
                prevLoops.map((loop) => {
                    const rotationSpeed = loop.current * 0.01;
                    // Calculate particle positions for current visualization
                    const particles = [];
                    for (let i = 0; i < Math.abs(loop.current) * 2; i++) {
                        const angle =
                            (i / (Math.abs(loop.current) * 2)) * Math.PI * 2 +
                            animationTime *
                                rotationSpeed *
                                Math.sign(loop.current);
                        particles.push(angle);
                    }
                    return {
                        ...loop,
                        particles,
                    };
                })
            );

            // Animate charges' field fluctuations
            setCharges((prevCharges) =>
                prevCharges.map((charge) => {
                    const pulseRate = 0.5 + Math.abs(charge.charge) * 0.1;
                    const pulseMagnitude =
                        Math.sin(animationTime * pulseRate) * 0.1 + 1;
                    return {
                        ...charge,
                        pulseMagnitude,
                    };
                })
            );

            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isRunning, animationSpeed, animationTime]);

    // Calculate electric field at a point
    const calculateElectricField = (x, y) => {
        let Ex = 0;
        let Ey = 0;

        charges.forEach((charge) => {
            const dx = x - charge.x;
            const dy = y - charge.y;
            const distanceSq = dx * dx + dy * dy;
            const distance = Math.sqrt(distanceSq);

            if (distance < 10) return; // Prevent division by zero

            // Coulomb's law: E = k * q / r^2
            const pulseMagnitude = charge.pulseMagnitude || 1;
            const magnitude =
                ((charge.charge * fieldStrength) / distanceSq) * pulseMagnitude;

            Ex += (magnitude * dx) / distance;
            Ey += (magnitude * dy) / distance;
        });

        return { Ex, Ey };
    };

    // Calculate magnetic field at a point (simplified)
    const calculateMagneticField = (x, y) => {
        let Bz = 0;

        currentLoops.forEach((loop) => {
            const dx = x - loop.x;
            const dy = y - loop.y;
            const distanceSq = dx * dx + dy * dy;
            const distance = Math.sqrt(distanceSq);

            if (distance < 1) return; // Prevent division by zero

            // Simplified magnetic field calculation for a current loop
            // Using Biot-Savart law approximation
            if (distance < loop.radius) {
                // Inside the loop: field is strongest and uniform
                Bz += loop.current * 0.15;
            } else {
                // Outside the loop: field decreases with distance
                Bz +=
                    ((loop.current * loop.radius * loop.radius) /
                        (distanceSq * distance)) *
                    50;
            }
        });

        return { Bz };
    };

    // Draw the visualization
    const drawScene = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Background
        ctx.fillStyle = theme === "dark" ? "#0f172a" : "#f1f5f9";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw grid
        ctx.strokeStyle = theme === "dark" ? "#2e3947" : "#e5e7eb";
        ctx.lineWidth = 1;

        // Draw grid lines
        for (let i = 0; i <= 10; i++) {
            ctx.beginPath();
            ctx.moveTo(i * (canvas.width / 10), 0);
            ctx.lineTo(i * (canvas.width / 10), canvas.height);
            ctx.stroke();
        }

        for (let i = 0; i <= 5; i++) {
            ctx.beginPath();
            ctx.moveTo(0, i * (canvas.height / 5));
            ctx.lineTo(canvas.width, i * (canvas.height / 5));
            ctx.stroke();
        }

        // Draw field vectors and lines
        if (showElectricField || showMagneticField) {
            drawFields(ctx);
        }

        // Draw field lines
        if (showFieldLines) {
            drawFieldLines(ctx);
        }

        // Draw current loops
        currentLoops.forEach((loop) => {
            drawCurrentLoop(ctx, loop);
        });

        // Draw charges
        charges.forEach((charge) => {
            drawCharge(ctx, charge);
        });

        // Draw interaction mode indicator
        drawModeIndicator(ctx);
    };

    // Draw interaction mode indicator
    const drawModeIndicator = (ctx) => {
        // Draw a small indicator near the cursor to show current mode
        const canvas = canvasRef.current;
        if (!canvas) return;

        const indicatorSize = 10;
        const padding = 15;

        ctx.save();
        ctx.fillStyle =
            theme === "dark"
                ? "rgba(255, 255, 255, 0.1)"
                : "rgba(0, 0, 0, 0.05)";
        ctx.fillRect(padding, padding, 170, 30);
        ctx.restore();

        ctx.font = "12px Arial";
        ctx.fillStyle = theme === "dark" ? "#94a3b8" : "#64748b";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";

        let modeText = "";
        let modeColor = "";

        switch (interactionMode) {
            case "move":
                modeText = "Move Mode: Drag charges and loops";
                modeColor = theme === "dark" ? "#d1d5db" : "#4b5563";
                break;
            case "add_positive":
                modeText = "Add Positive Charge Mode";
                modeColor = theme === "dark" ? "#ef4444" : "#dc2626";
                break;
            case "add_negative":
                modeText = "Add Negative Charge Mode";
                modeColor = theme === "dark" ? "#3b82f6" : "#2563eb";
                break;
            case "add_current":
                modeText = "Add Current Loop Mode";
                modeColor = theme === "dark" ? "#06b6d4" : "#0891b2";
                break;
            default:
                modeText = "Unknown Mode";
        }

        ctx.fillText(modeText, padding + 10, padding + 15);

        // Indicator circle
        ctx.beginPath();
        ctx.arc(padding + 160, padding + 15, 6, 0, Math.PI * 2);
        ctx.fillStyle = modeColor;
        ctx.fill();
    };

    // Draw electric and magnetic field vectors
    const drawFields = (ctx) => {
        const stepSize = canvasWidth / fieldDensity;

        for (let x = stepSize / 2; x < canvasWidth; x += stepSize) {
            for (let y = stepSize / 2; y < canvasHeight; y += stepSize) {
                // Skip drawing fields very close to charges or current loops
                let skipPoint = false;

                charges.forEach((charge) => {
                    const dx = x - charge.x;
                    const dy = y - charge.y;
                    const distanceSq = dx * dx + dy * dy;
                    if (distanceSq < 400) skipPoint = true; // 20px radius
                });

                currentLoops.forEach((loop) => {
                    const dx = x - loop.x;
                    const dy = y - loop.y;
                    const distanceSq = dx * dx + dy * dy;
                    if (Math.sqrt(distanceSq) < loop.radius + 10)
                        skipPoint = true;
                });

                if (skipPoint) continue;

                if (showElectricField) {
                    const { Ex, Ey } = calculateElectricField(x, y);
                    const eFieldMagnitude = Math.sqrt(Ex * Ex + Ey * Ey);

                    if (eFieldMagnitude > 0.05) {
                        const maxLength = 10;
                        const scaleFactor = Math.min(
                            maxLength / eFieldMagnitude,
                            2
                        );
                        const arrowLength = eFieldMagnitude * scaleFactor;

                        const normalizedEx = Ex / eFieldMagnitude;
                        const normalizedEy = Ey / eFieldMagnitude;

                        const startX = x - (normalizedEx * arrowLength) / 2;
                        const startY = y - (normalizedEy * arrowLength) / 2;
                        const endX = x + (normalizedEx * arrowLength) / 2;
                        const endY = y + (normalizedEy * arrowLength) / 2;

                        // Apply subtle animation effect to electric field arrows
                        const animatedArrowLength =
                            arrowLength *
                            (1 + Math.sin(animationTime * 2 + x + y) * 0.1);
                        const animatedEndX =
                            x + (normalizedEx * animatedArrowLength) / 2;
                        const animatedEndY =
                            y + (normalizedEy * animatedArrowLength) / 2;
                        const animatedStartX =
                            x - (normalizedEx * animatedArrowLength) / 2;
                        const animatedStartY =
                            y - (normalizedEy * animatedArrowLength) / 2;

                        // Draw electric field arrow
                        drawArrow(
                            ctx,
                            animatedStartX,
                            animatedStartY,
                            animatedEndX,
                            animatedEndY,
                            theme === "dark"
                                ? "rgba(239, 68, 68, 0.6)"
                                : "rgba(239, 68, 68, 0.8)"
                        );
                    }
                }

                if (showMagneticField) {
                    const { Bz } = calculateMagneticField(x, y);

                    if (Math.abs(Bz) > 0.05) {
                        // Apply animation to magnetic field indicators
                        const pulseEffect =
                            1 +
                            Math.sin(animationTime * 3 + x * 0.1 + y * 0.1) *
                                0.15;
                        const radius =
                            Math.min(Math.abs(Bz) * 2, 5) * pulseEffect;

                        // Draw magnetic field dot/cross
                        ctx.beginPath();
                        ctx.arc(x, y, radius, 0, Math.PI * 2);

                        if (Bz > 0) {
                            // Dot (field coming out of the screen)
                            ctx.fillStyle =
                                theme === "dark"
                                    ? "rgba(59, 130, 246, 0.6)"
                                    : "rgba(59, 130, 246, 0.8)";
                            ctx.fill();
                        } else {
                            // Cross (field going into the screen)
                            ctx.fillStyle =
                                theme === "dark"
                                    ? "rgba(59, 130, 246, 0.2)"
                                    : "rgba(59, 130, 246, 0.3)";
                            ctx.fill();

                            ctx.beginPath();
                            ctx.moveTo(x - radius * 0.7, y - radius * 0.7);
                            ctx.lineTo(x + radius * 0.7, y + radius * 0.7);
                            ctx.moveTo(x + radius * 0.7, y - radius * 0.7);
                            ctx.lineTo(x - radius * 0.7, y + radius * 0.7);
                            ctx.strokeStyle =
                                theme === "dark"
                                    ? "rgba(59, 130, 246, 0.6)"
                                    : "rgba(59, 130, 246, 0.8)";
                            ctx.lineWidth = 1;
                            ctx.stroke();
                        }
                    }
                }
            }
        }
    };

    // Draw field lines
    const drawFieldLines = (ctx) => {
        if (showElectricField) {
            // Draw electric field lines from positive charges
            charges
                .filter((c) => c.charge > 0)
                .forEach((charge) => {
                    const numLines = Math.abs(charge.charge) * 2;

                    for (let i = 0; i < numLines; i++) {
                        const angle = (i / numLines) * Math.PI * 2;
                        // Add animation to starting point
                        const animationOffset =
                            Math.sin(animationTime * 2 + i) * 2;
                        const startX =
                            charge.x + (15 + animationOffset) * Math.cos(angle);
                        const startY =
                            charge.y + (15 + animationOffset) * Math.sin(angle);

                        // Trace field line
                        ctx.beginPath();
                        ctx.moveTo(startX, startY);

                        let x = startX;
                        let y = startY;
                        let steps = 0;
                        const maxSteps = 200;

                        while (steps < maxSteps) {
                            const { Ex, Ey } = calculateElectricField(x, y);
                            const magnitude = Math.sqrt(Ex * Ex + Ey * Ey);

                            if (magnitude < 0.05) break;

                            const dx = (Ex / magnitude) * 3;
                            const dy = (Ey / magnitude) * 3;

                            x += dx;
                            y += dy;

                            // Check if we're close to a negative charge
                            let closeToNegative = false;
                            charges.forEach((c) => {
                                if (c.charge < 0) {
                                    const dist = Math.sqrt(
                                        Math.pow(x - c.x, 2) +
                                            Math.pow(y - c.y, 2)
                                    );
                                    if (dist < 15) closeToNegative = true;
                                }
                            });

                            if (closeToNegative) break;

                            // Check if we're out of bounds
                            if (
                                x < 0 ||
                                x > canvasWidth ||
                                y < 0 ||
                                y > canvasHeight
                            )
                                break;

                            ctx.lineTo(x, y);
                            steps++;
                        }

                        // Add animation effect to electric field lines
                        const opacity =
                            0.3 + Math.sin(animationTime * 2 + i) * 0.1;
                        ctx.strokeStyle =
                            theme === "dark"
                                ? `rgba(239, 68, 68, ${opacity})`
                                : `rgba(239, 68, 68, ${opacity + 0.2})`;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                });
        }

        if (showMagneticField) {
            // Draw magnetic field lines around current loops
            currentLoops.forEach((loop) => {
                const numLines = 12;
                const radius = loop.radius;

                for (let i = 0; i < numLines; i++) {
                    // Add animation to magnetic field lines
                    const angle = (i / numLines) * Math.PI * 2;
                    const pulseFactor =
                        1 + Math.sin(animationTime * 2 + i) * 0.05;

                    ctx.beginPath();
                    ctx.arc(
                        loop.x,
                        loop.y,
                        (radius + 10 + i * 2) * pulseFactor,
                        0,
                        Math.PI * 2
                    );
                    const opacity = 0.2 + Math.sin(animationTime + i) * 0.05;
                    ctx.strokeStyle =
                        theme === "dark"
                            ? `rgba(59, 130, 246, ${opacity})`
                            : `rgba(59, 130, 246, ${opacity + 0.2})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            });
        }
    };

    // Draw an arrow
    const drawArrow = (ctx, fromX, fromY, toX, toY, color) => {
        const headLength = 6;
        const dx = toX - fromX;
        const dy = toY - fromY;
        const angle = Math.atan2(dy, dx);

        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 1.5;

        // Draw line
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();

        // Draw arrowhead
        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(
            toX - headLength * Math.cos(angle - Math.PI / 6),
            toY - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
            toX - headLength * Math.cos(angle + Math.PI / 6),
            toY - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();
    };

    // Draw a charge
    const drawCharge = (ctx, charge) => {
        const pulseMagnitude = charge.pulseMagnitude || 1;
        const radius = (15 + Math.abs(charge.charge)) * pulseMagnitude;

        // Glow effect with animation
        const glowRadius =
            radius * 1.5 * (1 + Math.sin(animationTime * 2) * 0.1);
        const gradient = ctx.createRadialGradient(
            charge.x,
            charge.y,
            radius * 0.4,
            charge.x,
            charge.y,
            glowRadius
        );

        if (charge.charge > 0) {
            gradient.addColorStop(
                0,
                theme === "dark"
                    ? "rgba(239, 68, 68, 0.8)"
                    : "rgba(239, 68, 68, 1)"
            );
            gradient.addColorStop(1, "rgba(239, 68, 68, 0)");
        } else {
            gradient.addColorStop(
                0,
                theme === "dark"
                    ? "rgba(59, 130, 246, 0.8)"
                    : "rgba(59, 130, 246, 1)"
            );
            gradient.addColorStop(1, "rgba(59, 130, 246, 0)");
        }

        ctx.beginPath();
        ctx.arc(charge.x, charge.y, glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Charge circle
        ctx.beginPath();
        ctx.arc(charge.x, charge.y, radius, 0, Math.PI * 2);
        ctx.fillStyle =
            charge.charge > 0
                ? theme === "dark"
                    ? "#ef4444"
                    : "#dc2626"
                : theme === "dark"
                ? "#3b82f6"
                : "#2563eb";
        ctx.fill();

        // Charge symbol
        ctx.fillStyle = "#ffffff";
        ctx.font = "16px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(charge.charge > 0 ? "+" : "−", charge.x, charge.y);
    };

    // Draw a current loop
    const drawCurrentLoop = (ctx, loop) => {
        // Loop circle
        ctx.beginPath();
        ctx.arc(loop.x, loop.y, loop.radius, 0, Math.PI * 2);
        ctx.strokeStyle = theme === "dark" ? "#60a5fa" : "#3b82f6";
        ctx.lineWidth = 3;
        ctx.stroke();

        // Add animated particles along the loop to represent current
        const particles = loop.particles || [];
        if (particles.length === 0) {
            // If no particles yet, create them based on current strength
            for (let i = 0; i < Math.abs(loop.current) * 2; i++) {
                const angle = (i / (Math.abs(loop.current) * 2)) * Math.PI * 2;
                particles.push(angle);
            }
        }

        // Draw animated current particles
        particles.forEach((angle) => {
            const particleX = loop.x + loop.radius * Math.cos(angle);
            const particleY = loop.y + loop.radius * Math.sin(angle);

            ctx.beginPath();
            ctx.arc(particleX, particleY, 3, 0, Math.PI * 2);
            ctx.fillStyle = theme === "dark" ? "#93c5fd" : "#2563eb";
            ctx.fill();
        });

        // Current direction arrows (fewer, to not clutter with particles)
        const numArrows = 4;
        for (let i = 0; i < numArrows; i++) {
            const angle = (i / numArrows) * Math.PI * 2;
            const arrowX = loop.x + loop.radius * Math.cos(angle);
            const arrowY = loop.y + loop.radius * Math.sin(angle);

            // Tangent direction
            const tangentX = -Math.sin(angle) * 10;
            const tangentY = Math.cos(angle) * 10;

            if (loop.current > 0) {
                // Clockwise
                drawArrow(
                    ctx,
                    arrowX - tangentX / 2,
                    arrowY - tangentY / 2,
                    arrowX + tangentX / 2,
                    arrowY + tangentY / 2,
                    theme === "dark" ? "#60a5fa" : "#3b82f6"
                );
            } else {
                // Counter-clockwise
                drawArrow(
                    ctx,
                    arrowX + tangentX / 2,
                    arrowY + tangentY / 2,
                    arrowX - tangentX / 2,
                    arrowY - tangentY / 2,
                    theme === "dark" ? "#60a5fa" : "#3b82f6"
                );
            }
        }

        // Current value with subtle animation
        const pulsingSize = 1 + Math.sin(animationTime * 3) * 0.1;
        ctx.fillStyle = theme === "dark" ? "#f3f4f6" : "#1f2937";
        ctx.font = `${14 * pulsingSize}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${Math.abs(loop.current)} A`, loop.x, loop.y);
    };

    // Handle mouse interactions
    const handleMouseDown = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Calculate actual canvas coordinates by accounting for scaling
        const scaleX = canvasRef.current.width / rect.width;
        const scaleY = canvasRef.current.height / rect.height;
        const canvasX = x * scaleX;
        const canvasY = y * scaleY;

        // Check if we clicked on a charge or current loop
        let found = false;

        if (interactionMode === "move") {
            // Check charges
            for (let i = 0; i < charges.length; i++) {
                const charge = charges[i];
                const dx = canvasX - charge.x;
                const dy = canvasY - charge.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance <= 15 + Math.abs(charge.charge)) {
                    setSelectedEntity({ type: "charge", index: i });
                    found = true;
                    break;
                }
            }

            // Check current loops
            if (!found) {
                for (let i = 0; i < currentLoops.length; i++) {
                    const loop = currentLoops[i];
                    const dx = canvasX - loop.x;
                    const dy = canvasY - loop.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    // Check if we're near the loop's circumference
                    if (Math.abs(distance - loop.radius) <= 10) {
                        setSelectedEntity({ type: "loop", index: i });
                        found = true;
                        break;
                    }
                }
            }
        } else if (interactionMode === "add_positive") {
            // Add a new positive charge
            const newId =
                charges.length > 0
                    ? Math.max(...charges.map((c) => c.id)) + 1
                    : 1;
            setCharges([
                ...charges,
                {
                    x: canvasX,
                    y: canvasY,
                    charge: chargeStrength,
                    id: newId,
                    pulseMagnitude: 1,
                },
            ]);

            // Add a ripple effect animation
            addRippleEffect(canvasX, canvasY, "rgba(239, 68, 68, 0.5)");
        } else if (interactionMode === "add_negative") {
            // Add a new negative charge
            const newId =
                charges.length > 0
                    ? Math.max(...charges.map((c) => c.id)) + 1
                    : 1;
            setCharges([
                ...charges,
                {
                    x: canvasX,
                    y: canvasY,
                    charge: -chargeStrength,
                    id: newId,
                    pulseMagnitude: 1,
                },
            ]);

            // Add a ripple effect animation
            addRippleEffect(canvasX, canvasY, "rgba(59, 130, 246, 0.5)");
        } else if (interactionMode === "add_current") {
            // Add a new current loop
            const newId =
                currentLoops.length > 0
                    ? Math.max(...currentLoops.map((c) => c.id)) + 1
                    : 1;

            // Create particles for animation
            const particles = [];
            for (let i = 0; i < currentStrength * 2; i++) {
                const angle = (i / (currentStrength * 2)) * Math.PI * 2;
                particles.push(angle);
            }

            setCurrentLoops([
                ...currentLoops,
                {
                    x: canvasX,
                    y: canvasY,
                    radius: 50,
                    current: currentStrength,
                    id: newId,
                    particles,
                },
            ]);

            // Add a ripple effect animation
            addRippleEffect(canvasX, canvasY, "rgba(6, 182, 212, 0.5)");
        }
    };

    // Add ripple effect when adding new entities
    const addRippleEffect = (x, y, color) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        let radius = 0;
        const maxRadius = 50;
        let opacity = 0.7;

        const drawRipple = () => {
            radius += 2;
            opacity -= 0.02;

            if (radius <= maxRadius && opacity > 0) {
                // Draw on top of the current scene
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.strokeStyle = color.replace(")", `, ${opacity})`);
                ctx.lineWidth = 2;
                ctx.stroke();

                requestAnimationFrame(drawRipple);
            }
        };

        requestAnimationFrame(drawRipple);
    };

    const handleMouseMove = (e) => {
        if (!selectedEntity) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Calculate actual canvas coordinates by accounting for scaling
        const scaleX = canvasRef.current.width / rect.width;
        const scaleY = canvasRef.current.height / rect.height;
        const canvasX = x * scaleX;
        const canvasY = y * scaleY;

        if (selectedEntity.type === "charge") {
            const newCharges = [...charges];
            newCharges[selectedEntity.index] = {
                ...newCharges[selectedEntity.index],
                x: canvasX,
                y: canvasY,
            };
            setCharges(newCharges);

            // Create a trail effect
            addTrailEffect(
                canvasX,
                canvasY,
                newCharges[selectedEntity.index].charge > 0
                    ? "rgba(239, 68, 68, 0.15)"
                    : "rgba(59, 130, 246, 0.15)"
            );
        } else if (selectedEntity.type === "loop") {
            const newLoops = [...currentLoops];
            newLoops[selectedEntity.index] = {
                ...newLoops[selectedEntity.index],
                x: canvasX,
                y: canvasY,
            };
            setCurrentLoops(newLoops);

            // Create a trail effect
            addTrailEffect(canvasX, canvasY, "rgba(6, 182, 212, 0.15)");
        }
    };

    // Add a trail effect when moving entities
    const addTrailEffect = (x, y, color) => {
        if (!isRunning) return; // Only show trails during animation

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");

        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
    };

    const handleMouseUp = () => {
        setSelectedEntity(null);
    };

    // Reset simulation
    const resetSimulation = () => {
        setIsRunning(false);
        setCharges([
            { x: 150, y: 160, charge: 5, id: 1 },
            { x: 450, y: 160, charge: -5, id: 2 },
        ]);
        setCurrentLoops([{ x: 300, y: 160, radius: 50, current: 5, id: 1 }]);
        setShowElectricField(true);
        setShowMagneticField(true);
        setShowFieldLines(true);
        setAnimationTime(0);
    };

    // Toggle simulation
    const toggleSimulation = () => {
        setIsRunning(!isRunning);
    };

    return (
        <div className="pt-16 md:pt-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="flex items-center mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3">
                    <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                        Electric & Magnetic Fields
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Visualize interactions between electric charges and
                        current-carrying conductors
                    </p>
                </div>
            </div>

            {/* Main Layout - Grid with Controls, Simulation, and Legend side by side */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
                {/* Controls */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 lg:col-span-3">
                    <div className="flex items-center mb-4">
                        <Sliders className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                            Controls
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {/* Display controls */}
                        <div className="space-y-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Display
                            </span>

                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                    Electric Field
                                </span>
                                <button
                                    onClick={() =>
                                        setShowElectricField(!showElectricField)
                                    }
                                    className={`flex items-center px-3 py-1.5 rounded-md text-xs font-medium ${
                                        showElectricField
                                            ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400"
                                    }`}
                                >
                                    {showElectricField ? (
                                        <>
                                            <ToggleRight className="w-4 h-4 mr-1.5" />
                                            On
                                        </>
                                    ) : (
                                        <>
                                            <ToggleLeft className="w-4 h-4 mr-1.5" />
                                            Off
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                    Magnetic Field
                                </span>
                                <button
                                    onClick={() =>
                                        setShowMagneticField(!showMagneticField)
                                    }
                                    className={`flex items-center px-3 py-1.5 rounded-md text-xs font-medium ${
                                        showMagneticField
                                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400"
                                    }`}
                                >
                                    {showMagneticField ? (
                                        <>
                                            <ToggleRight className="w-4 h-4 mr-1.5" />
                                            On
                                        </>
                                    ) : (
                                        <>
                                            <ToggleLeft className="w-4 h-4 mr-1.5" />
                                            Off
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                    Field Lines
                                </span>
                                <button
                                    onClick={() =>
                                        setShowFieldLines(!showFieldLines)
                                    }
                                    className={`flex items-center px-3 py-1.5 rounded-md text-xs font-medium ${
                                        showFieldLines
                                            ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
                                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400"
                                    }`}
                                >
                                    {showFieldLines ? (
                                        <>
                                            <ToggleRight className="w-4 h-4 mr-1.5" />
                                            On
                                        </>
                                    ) : (
                                        <>
                                            <ToggleLeft className="w-4 h-4 mr-1.5" />
                                            Off
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Interaction Mode
                            </span>

                            <div className="mt-2 grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setInteractionMode("move")}
                                    className={`flex items-center justify-center py-2 px-3 rounded-md text-xs font-medium ${
                                        interactionMode === "move"
                                            ? "bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-100"
                                            : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                                    }`}
                                >
                                    <Move className="w-3 h-3 mr-1.5" />
                                    Move
                                </button>

                                <button
                                    onClick={() =>
                                        setInteractionMode("add_positive")
                                    }
                                    className={`flex items-center justify-center py-2 px-3 rounded-md text-xs font-medium ${
                                        interactionMode === "add_positive"
                                            ? "bg-red-200 dark:bg-red-900/50 text-red-800 dark:text-red-100"
                                            : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                                    }`}
                                >
                                    <Plus className="w-3 h-3 mr-1.5" />
                                    Add +
                                </button>

                                <button
                                    onClick={() =>
                                        setInteractionMode("add_negative")
                                    }
                                    className={`flex items-center justify-center py-2 px-3 rounded-md text-xs font-medium ${
                                        interactionMode === "add_negative"
                                            ? "bg-blue-200 dark:bg-blue-900/50 text-blue-800 dark:text-blue-100"
                                            : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                    }`}
                                >
                                    <Minus className="w-3 h-3 mr-1.5" />
                                    Add -
                                </button>

                                <button
                                    onClick={() =>
                                        setInteractionMode("add_current")
                                    }
                                    className={`flex items-center justify-center py-2 px-3 rounded-md text-xs font-medium ${
                                        interactionMode === "add_current"
                                            ? "bg-cyan-200 dark:bg-cyan-900/50 text-cyan-800 dark:text-cyan-100"
                                            : "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400"
                                    }`}
                                >
                                    <Magnet className="w-3 h-3 mr-1.5" />
                                    Add Loop
                                </button>
                            </div>
                        </div>

                        <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Charge Properties
                            </span>

                            <div className="mt-2 space-y-3">
                                <div>
                                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                        Charge Strength
                                    </label>
                                    <input
                                        type="range"
                                        min="1"
                                        max="10"
                                        step="1"
                                        value={chargeStrength}
                                        onChange={(e) =>
                                            setChargeStrength(
                                                parseInt(e.target.value)
                                            )
                                        }
                                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        <span>Weak</span>
                                        <span>{chargeStrength}</span>
                                        <span>Strong</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                        Current Strength
                                    </label>
                                    <input
                                        type="range"
                                        min="1"
                                        max="10"
                                        step="1"
                                        value={currentStrength}
                                        onChange={(e) =>
                                            setCurrentStrength(
                                                parseInt(e.target.value)
                                            )
                                        }
                                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        <span>Weak</span>
                                        <span>{currentStrength} A</span>
                                        <span>Strong</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                        Animation Speed
                                    </label>
                                    <input
                                        type="range"
                                        min="0.5"
                                        max="2.5"
                                        step="0.5"
                                        value={animationSpeed}
                                        onChange={(e) =>
                                            setAnimationSpeed(
                                                parseFloat(e.target.value)
                                            )
                                        }
                                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        <span>Slow</span>
                                        <span>{animationSpeed}x</span>
                                        <span>Fast</span>
                                    </div>
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

                {/* Simulation & Legend */}
                <div className="lg:col-span-9 space-y-6">
                    {/* Simulation Canvas */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                                Field Visualization
                            </h2>
                            <button
                                onClick={() => setShowHelp(!showHelp)}
                                className="text-sm flex items-center px-3 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                            >
                                <Info className="w-4 h-4 mr-1.5" />
                                {showHelp ? "Hide Help" : "Show Help"}
                            </button>
                        </div>

                        {showHelp && (
                            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-800 dark:text-blue-100">
                                <p className="mb-2">
                                    <strong>How to interact:</strong>
                                </p>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>
                                        Select <strong>Move</strong> mode to
                                        drag charges and current loops
                                    </li>
                                    <li>
                                        Use <strong>Add +</strong> to place
                                        positive charges
                                    </li>
                                    <li>
                                        Use <strong>Add -</strong> to place
                                        negative charges
                                    </li>
                                    <li>
                                        Use <strong>Add Loop</strong> to add
                                        current loops
                                    </li>
                                    <li>
                                        Red arrows show electric field direction
                                    </li>
                                    <li>
                                        Blue dots/crosses show magnetic field
                                        direction
                                    </li>
                                    <li>
                                        Press <strong>Start</strong> to see
                                        animated field effects
                                    </li>
                                </ul>
                            </div>
                        )}

                        <div className="bg-gray-100 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <canvas
                                ref={canvasRef}
                                width={canvasWidth}
                                height={canvasHeight}
                                className="w-full h-80"
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                            ></canvas>
                        </div>

                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900/30">
                                <div className="flex items-center justify-center mb-1">
                                    <Plus className="h-4 w-4 text-red-600 dark:text-red-400" />
                                </div>
                                <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                                    POSITIVE CHARGE
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    Creates radial electric field
                                </p>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30">
                                <div className="flex items-center justify-center mb-1">
                                    <Minus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                    NEGATIVE CHARGE
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    Creates inward electric field
                                </p>
                            </div>

                            <div className="bg-cyan-50 dark:bg-cyan-900/20 p-3 rounded-lg border border-cyan-100 dark:border-cyan-900/30">
                                <div className="flex items-center justify-center mb-1">
                                    <Magnet className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                                </div>
                                <p className="text-xs text-cyan-600 dark:text-cyan-400 font-medium">
                                    CURRENT LOOP
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    Creates magnetic field
                                </p>
                            </div>

                            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-100 dark:border-purple-900/30">
                                <div className="flex items-center justify-center mb-1">
                                    <Layers className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                </div>
                                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                                    FIELD LINES
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    Show field direction
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Theory and explanation - Improved layout */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center">
                            <span className="bg-gradient-to-r from-blue-500 to-purple-600 w-1 h-6 rounded mr-2"></span>
                            Electromagnetic Theory
                        </h2>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 rounded-xl p-5 border border-blue-200 dark:border-blue-900/40">
                                <h3 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-3">
                                    Electric Fields
                                </h3>
                                <p className="text-blue-900 dark:text-blue-100 mb-3">
                                    Electric fields are created by electric
                                    charges and exert forces on other charged
                                    objects. The electric field points away from
                                    positive charges and toward negative
                                    charges. The strength of the electric field
                                    decreases with the square of the distance
                                    from the charge.
                                </p>

                                <div className="mt-4 bg-white/70 dark:bg-slate-800/60 rounded-lg p-3 border border-blue-200 dark:border-blue-800/40">
                                    <h4 className="font-semibold text-blue-700 dark:text-blue-400 text-sm mb-1">
                                        Coulomb's Law:
                                    </h4>
                                    <p className="text-blue-900 dark:text-blue-100 text-sm">
                                        The force between two point charges is
                                        directly proportional to the product of
                                        their charges and inversely proportional
                                        to the square of the distance between
                                        them:
                                    </p>
                                    <div className="bg-blue-100 dark:bg-blue-900/40 mt-2 p-2 rounded text-center font-mono text-blue-900 dark:text-blue-100">
                                        F = k·q₁·q₂/r²
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/30 rounded-xl p-5 border border-purple-200 dark:border-purple-900/40">
                                <h3 className="text-lg font-medium text-purple-800 dark:text-purple-300 mb-3">
                                    Magnetic Fields
                                </h3>
                                <p className="text-purple-900 dark:text-purple-100 mb-3">
                                    Magnetic fields are created by moving
                                    charges (currents) and exert forces on other
                                    moving charges. Current loops create
                                    magnetic fields that resemble those of bar
                                    magnets, with field lines emerging from one
                                    face and entering the other.
                                </p>

                                <div className="mt-4 bg-white/70 dark:bg-slate-800/60 rounded-lg p-3 border border-purple-200 dark:border-purple-800/40">
                                    <h4 className="font-semibold text-purple-700 dark:text-purple-400 text-sm mb-1">
                                        Biot-Savart Law:
                                    </h4>
                                    <p className="text-purple-900 dark:text-purple-100 text-sm">
                                        The magnetic field created by a current
                                        element is proportional to the current,
                                        perpendicular to both the current
                                        direction and the displacement vector,
                                        and inversely proportional to the square
                                        of the distance:
                                    </p>
                                    <div className="bg-purple-100 dark:bg-purple-900/40 mt-2 p-2 rounded text-center font-mono text-purple-900 dark:text-purple-100">
                                        dB = (μ₀/4π) · (I·dl × r̂)/r²
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-2 bg-gradient-to-br from-cyan-50 to-emerald-50 dark:from-cyan-900/20 dark:to-emerald-900/20 rounded-xl p-5 border border-cyan-200 dark:border-cyan-900/40">
                                <h3 className="text-lg font-medium text-cyan-800 dark:text-cyan-300 mb-3">
                                    Electromagnetic Induction
                                </h3>
                                <p className="text-cyan-900 dark:text-cyan-100">
                                    A changing magnetic field creates an
                                    electric field, and a changing electric
                                    field creates a magnetic field. This
                                    principle is the foundation of
                                    electromagnetic waves and many modern
                                    technologies like electric generators and
                                    motors.
                                </p>

                                <div className="mt-4 grid grid-cols-3 gap-4">
                                    <div className="bg-white/70 dark:bg-slate-800/60 rounded-lg p-3 text-center shadow-sm border border-emerald-100 dark:border-emerald-900/30">
                                        <h4 className="font-semibold text-cyan-700 dark:text-cyan-400 text-sm">
                                            Faraday's Law
                                        </h4>
                                        <div className="h-12 flex items-center justify-center">
                                            <span className="text-emerald-700 dark:text-emerald-300 text-xs">
                                                Changing B-field induces EMF
                                            </span>
                                        </div>
                                    </div>
                                    <div className="bg-white/70 dark:bg-slate-800/60 rounded-lg p-3 text-center shadow-sm border border-emerald-100 dark:border-emerald-900/30">
                                        <h4 className="font-semibold text-cyan-700 dark:text-cyan-400 text-sm">
                                            Maxwell's Equations
                                        </h4>
                                        <div className="h-12 flex items-center justify-center">
                                            <span className="text-emerald-700 dark:text-emerald-300 text-xs">
                                                Unify electricity & magnetism
                                            </span>
                                        </div>
                                    </div>
                                    <div className="bg-white/70 dark:bg-slate-800/60 rounded-lg p-3 text-center shadow-sm border border-emerald-100 dark:border-emerald-900/30">
                                        <h4 className="font-semibold text-cyan-700 dark:text-cyan-400 text-sm">
                                            Lenz's Law
                                        </h4>
                                        <div className="h-12 flex items-center justify-center">
                                            <span className="text-emerald-700 dark:text-emerald-300 text-xs">
                                                Induced current opposes change
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Electric;
