import React, { useState } from 'react';
import { auth, db } from './firebase';
import { useNavigate } from 'react-router-dom';
import { collection, doc, setDoc } from 'firebase/firestore';

import './Home.css';
import chessImg from './assets/log.jpg'; // remplace par ton image

export default function Home() {
    const [showModal, setShowModal] = useState(false);
    const currentUser = auth.currentUser;
    const navigate = useNavigate();

    const newGameOptions = [
        { label: 'Black pieces', value: 'b' },
        { label: 'White pieces', value: 'w' },
        { label: 'Random', value: 'r' }
    ];

    function handlePlayLocally() {
        // Logique jeu local
    }

    function handlePlayOnline() {
        setShowModal(true);
    }

    async function startOnlineGame(startingPiece) {
        if (!currentUser) return;

        const member = {
            uid: currentUser.uid,
            piece: startingPiece === 'r'
                ? ['b', 'w'][Math.round(Math.random())]
                : startingPiece,
            name: localStorage.getItem('userName'),
            creator: true
        };

        const gameId = `${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;

        const game = {
            members: [member],
            gameId,
            status: 'waiting'
        };

        const gameRef = doc(collection(db, 'games'), gameId);
        await setDoc(gameRef, game);

        navigate(`/game/${gameId}`);
    }

    return (
        <div className="home-container">
            <div className="home-left">
                <img src={chessImg} alt="Chess" className="home-image"/>
            </div>

            <div className="home-right">
                <h1>Welcome to ChessApp</h1>
                <p>Play locally or start an online game with friends!</p>
                <div className="home-buttons">
                    <button className="btn-local" onClick={handlePlayLocally}>Play Locally</button>
                    <button className="btn-online" onClick={handlePlayOnline}>Play Online</button>
                </div>
            </div>
            <div className={`modal ${showModal ? 'is-active' : ''}`}>
            <div
                className="modal-background"
                onClick={() => setShowModal(false)}
            ></div>

            <div className="modal-card">
                <header className="modal-card-head">
                <p className="modal-card-title">Choose your piece</p>
                <button
                    className="delete"
                    aria-label="close"
                    onClick={() => setShowModal(false)}
                ></button>
                </header>

                {/* Corps de la modale */}
                <section className="modal-card-body">
                <p className="modal-text">
                    Please select the piece you want to play with.
                </p>
                </section>

                <footer className="modal-card-foot">
                {newGameOptions.map((option) => (
                    <button
                    className="btn-piece"
                    key={option.value}
                    onClick={() => startOnlineGame(option.value)}
                    >
                    {option.label}
                    </button>
                ))}
                </footer>
            </div>
            </div>

        </div>
    );
}
