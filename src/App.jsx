import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PhysicsSidebar from "./components/PhysicsSidebar.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";

// Import your page components
import HomePage from "./pages/Home.jsx";
import PendulumPage from "./pages/Pendulum.jsx";
import WavePage from "./pages/Wave.jsx";
import ElectricPage from "./pages/Electric.jsx";
import RelativityPage from "./pages/Relativity.jsx";
import OrbitalPage from "./pages/Orbital.jsx";
import QuantumPage from "./pages/Quantum.jsx";
import HarmonicPage from "./pages/Harmonic.jsx";
import FluidsPage from "./pages/Fluids.jsx";
import ProjectilePage from "./pages/Projectile.jsx";
import LensPage from "./pages/Lens.jsx";
import MagnetPage from "./pages/Magnet.jsx";
import EntropyPage from "./pages/Entropy.jsx";

function App() {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <ThemeProvider>
            <Router>
                <div className="flex min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-300">
                    <PhysicsSidebar
                        isOpen={sidebarOpen}
                        setIsOpen={setSidebarOpen}
                    />

                    <main
                        className={`flex-1 transition-all duration-300 p-6 ${
                            sidebarOpen ? "md:ml-64" : "md:ml-20"
                        }`}
                    >
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route
                                path="/pendulum"
                                element={<PendulumPage />}
                            />
                            <Route path="/wave" element={<WavePage />} />
                            <Route
                                path="/electric"
                                element={<ElectricPage />}
                            />
                            <Route
                                path="/relativity"
                                element={<RelativityPage />}
                            />
                            <Route path="/orbital" element={<OrbitalPage />} />
                            <Route path="/quantum" element={<QuantumPage />} />
                            <Route
                                path="/harmonic"
                                element={<HarmonicPage />}
                            />
                            <Route path="/fluids" element={<FluidsPage />} />
                            <Route
                                path="/projectile"
                                element={<ProjectilePage />}
                            />
                            <Route path="/lens" element={<LensPage />} />
                            <Route path="/magnet" element={<MagnetPage />} />
                            <Route path="/entropy" element={<EntropyPage />} />
                        </Routes>
                    </main>
                </div>
            </Router>
        </ThemeProvider>
    );
}

export default App;
