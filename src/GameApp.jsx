
import React, { useState, useEffect } from 'react';
import UserForm from './UserForm';
import { gameSubject, initGame, resetGame } from './Game';
import './App.css';
import Board from './Board';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from './firebase';
import { doc, getDoc } from 'firebase/firestore';


function GameApp() {
  const [gameState, setGameState] = useState({
    board: [],
    position: 'w',
    isGameOver: false,
    result: null,
    pendingPromotion: null
  });
  const [initResult, setInitResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playerColor, setPlayerColor] = useState(null);
  const [status,setStatus] = useState('waiting');
  const [game,setGame] = useState({}); 
  const [userName, setUserName] = useState(localStorage.getItem('userName') || '');
  const { id } = useParams();

  const navigate = useNavigate(); 

  const sharebleLink = window.location.href;

  useEffect(() => {
    if (!userName) return;
    const gameSubscription = gameSubject.subscribe({
      next: (state) => setGameState(state),
      error: (err) => console.error('Game subject error:', err)
    });

    async function initializeGame() {
      try {
        const gameRef = id !== 'local' ? doc(db, 'games', id) : null;
        const result = await initGame(gameRef);

        if (gameRef) {
          const gameDoc = await getDoc(gameRef);
          const gameData = gameDoc.data();
          const user = auth.currentUser;
          if (gameData && user) {
            const member = gameData.members.find(m => m.uid === user.uid);
            if (member) setPlayerColor(member.piece);
            const opponent = gameData.members.find(m => m.uid !== user.uid);
            setGame({
              member,
              opponent
            });
          }
        } else {
          setPlayerColor('w');
          setGame({
            member: { name: userName, piece: 'w' },
            opponent: { name: 'Adversaire', piece: 'b' }
          });
        }

        setInitResult(result);
      } catch (error) {
        console.error("Game initialization error:", error);
        setInitResult(error.message || 'Failed to initialize game');
      } finally {
        setLoading(false);
      } 
    }

    initializeGame();

    return () => {
      gameSubscription.unsubscribe();
    };
  }, [id, userName]);

  async function copyToClipBoard() {
    try {
      await navigator.clipboard.writeText(sharebleLink);
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  }

  if (!userName) {
  return <UserForm onNameSubmit={setUserName} />;
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading game...</p>
      </div>
    );
  }

  if (initResult) {
    const errorMessages = {
      'Game already started': 'This game has already started. Please create or join another game.',
      'Game not found': 'The requested game was not found. Please check the game ID.',
      'intruder': 'You are not authorized to join this game.',
      'default': `Error: ${initResult}`
    };

    return (
      <div className="error-message">
        {errorMessages[initResult] || errorMessages.default}
      </div>
    );
  }

  return (
    <div className="app-container">
      {gameState.isGameOver && (
        <div className="game-over-modal">
          <h2>GAME OVER</h2>
          <div className="result">{gameState.result}</div>
          <button 
            className="new-game-button"
            onClick={ async () =>{ await resetGame()
              navigate.push('/'); }}
          >
            New Game
          </button>
        </div>
      )}

      <div className="board-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Nom de l'adversaire à gauche */}
        <div style={{ minWidth: 100, textAlign: 'center', fontWeight: 'bold' }}>
          {game.opponent && game.opponent.name}
        </div>
        <Board 
          board={gameState.board} 
          position={playerColor || 'w'}
          playerColor={playerColor}
          pendingPromotion={gameState.pendingPromotion}
        />
        {/* Nom du joueur à droite */}
        <div style={{ minWidth: 100, textAlign: 'center', fontWeight: 'bold' }}>
          {game.member && game.member.name}
        </div>
      </div>

      {gameState.result && !gameState.isGameOver && (
        <div className="game-status">
          {gameState.result}
        </div>
      )}
      {status ==='waiting' && (
        <div className='notification is-link share-game'>
        <strong>share this game to continue</strong>
        <br />
        <br />
        <div className='field has-addons'>
          <div className='control is-expanded'>
            <input type="text" name='' id='' className='input' readOnly value={sharebleLink} />

          </div>
          <div className='control'>
            <button className='button is-info' onClick={copyToClipBoard}> copy</button>

          </div>

        </div>

      </div>

      )}
    </div>
  );
}

export default GameApp; 