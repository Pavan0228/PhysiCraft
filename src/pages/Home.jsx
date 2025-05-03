import { Link } from "react-router-dom";

const visualizers = [
    { title: "Double Pendulum", desc: "Shows sensitive dependence on initial conditions.", path: "/pendulum" },
    { title: "Wave Interference", desc: "Simulate double slit experiment.", path: "/wave" },
    { title: "Electric Fields", desc: "Visualize field lines dynamically.", path: "/electric" },
    { title: "Relativistic Effects", desc: "See time dilation and length contraction.", path: "/relativity" },
    { title: "Orbital Mechanics", desc: "N-body simulation of gravity.", path: "/orbital" },
    { title: "Quantum Evolution", desc: "1D/2D wavefunction visualizer.", path: "/quantum" },
    { title: "Harmonic Motion", desc: "Lissajous curves and oscillations.", path: "/harmonic" },
    { title: "Fluid Simulation", desc: "Navier-Stokes smoke simulation.", path: "/fluids" },
    { title: "Projectile Motion", desc: "With drag and wind resistance.", path: "/projectile" },
    { title: "Ray Diagrams", desc: "Interactive lens and mirror simulation.", path: "/lens" },
    { title: "Magnetic Levitation", desc: "Simulate Meissner effect and EM fields.", path: "/magnet" },
    { title: "Gas Entropy", desc: "2D molecular motion and temperature.", path: "/entropy" },
];

export default function Home() {
    return (
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {visualizers.map(({ title, desc, path }) => (
                <Link to={path} key={path}>
                    <div className="p-5 bg-slate-800 rounded-2xl shadow-md hover:shadow-lg transition-all text-white hover:bg-slate-700">
                        <h2 className="text-xl font-bold mb-2">{title}</h2>
                        <p className="text-sm text-gray-300">{desc}</p>
                    </div>
                </Link>
            ))}
        </div>
    );
}