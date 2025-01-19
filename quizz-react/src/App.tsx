
import './App.css'
import {createBrowserRouter, Navigate,RouterProvider} from "react-router-dom";
import Login from "./components/Form/Login";
import Register from "./components/Form/Register.tsx";
import Layout from "./components/Layouts/Layout.tsx";
import Dashboard from "./components/Dashboard.tsx";
import {AuthProvider, useAuth} from "./context/AuthContext.tsx";
import Home from "./components/Home.tsx";
import Game from "./components/Game.tsx";
import WaitingParty from "./components/WaitingParty.tsx";
import {SocketProvider} from "./context/SocketContext.tsx";

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
                { path: "/waiting/:id", element: <ProtectedRoute component={<WaitingParty />} /> },
                { path: "/game/:id", element: <ProtectedRoute component={<Game />} /> }
            ],
        },
    ]);

    return (
        <SocketProvider>
            <AuthProvider>
                    <RouterProvider router={router} />
            </AuthProvider>
        </SocketProvider>
    );
}



// @ts-ignore
function ProtectedRoute({ component }) {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? component : <Navigate to="/login" />;
}

export default App
