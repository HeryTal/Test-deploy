import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; 
import GameApp from './GameApp.jsx';
import Home from './Home.jsx';
import UserForm from './UserForm.jsx';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase.js';

export default function App() {
    const [user, loading, error] = useAuthState(auth);
    
    if (loading) return <p>Loading...</p>;

    if (error) {
        console.error("Error fetching user:", error);
        return <p>Error fetching user</p>;
    }


    if (!user || !localStorage.getItem('userName')) {
        return <UserForm />;
    }

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/home" element={<Home />} />
                <Route path="/game/:id" element={<GameApp />} />
            </Routes>
        </Router>
    );

}
