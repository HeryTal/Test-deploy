import React, { useState } from 'react';
import { auth } from './firebase';
import { signInAnonymously, onAuthStateChanged, signOut } from 'firebase/auth';
import './UserForm.css'; 
import logo from './assets/log.jpg'; // Adjust the path as necessary

export default function UserForm({ onNameSubmit }) {
    const [name, setName] = useState('');

    // Efface le nom utilisateur à la déconnexion
    React.useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                localStorage.removeItem('userName');
            }
        });
        return () => unsubscribe();
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!name.trim()) return;
        localStorage.setItem('userName', name);
        if (onNameSubmit) onNameSubmit(name);
        await signInAnonymously(auth);
    }

    return (
        <div className="user-form-container">
            <div className="user-form-image">            
                <img src={logo} alt="Illustration" />
            </div>
            <div className="user-form-card">
                <h2>Enter your name</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        required
                    />
                    <button type="submit">Start Game</button>
                </form>
            </div>
        </div>
    );
}
