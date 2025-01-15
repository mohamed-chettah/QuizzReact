
import './App.css'
import {createBrowserRouter, Navigate, Route, Router, RouterProvider, Routes} from "react-router-dom";
import Login from "./components/Form/Login";
import Register from "./components/Form/Register.tsx";
import Layout from "./components/Layouts/Layout.tsx";
import Dashboard from "./components/Dashboard.tsx";
import {AuthProvider, useAuth} from "./context/AuthContext.tsx";
import {SocketProvider} from "./context/SocketContext.tsx";
import Home from "./components/Home.tsx";
import Game from "./components/Game.tsx";

function App() {
    const router = createBrowserRouter([
        {
            path: '/',
            element: <Layout />,
            children: [
                { path: "/", element: <Home /> },
                { path: "/register", element: <Register /> },
                { path: "/login", element: <Login /> },
                { path: "/dashboard", element: <ProtectedRoute component={<Dashboard />} /> },
                { path: "/game/:id", element: <ProtectedRoute component={<Game />} /> }
            ],
        },
    ]);

    return (
        <AuthProvider>
                <RouterProvider router={router} />
        </AuthProvider>
    );
}

function ProtectedRoute({ component }) {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? component : <Navigate to="/login" />;
}

export default App
