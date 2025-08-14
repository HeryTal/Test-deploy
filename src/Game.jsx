import { Chess } from 'chess.js';
import { BehaviorSubject } from 'rxjs';
import { getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { auth } from './firebase';

// Initialisation des variables
const chess = new Chess();
export const gameSubject = new BehaviorSubject({
  board: chess.board(),
  position: chess.turn(),
  isGameOver: false,
  result: null,
  pendingPromotion: null
});

let currentGameRef = null;
let unsubscribeSnapshot = null;

export async function initGame(gameRef) {
  const { currentUser } = auth;

  // Nettoyage des anciennes souscriptions
  if (unsubscribeSnapshot) {
    unsubscribeSnapshot();
    unsubscribeSnapshot = null;
  }

  chess.reset();
  currentGameRef = gameRef;

  if (gameRef) {
    try {
      const gameDoc = await getDoc(gameRef);
      
      if (!gameDoc.exists()) {
        throw new Error('Game not found');
      }

      const initialGame = gameDoc.data();
      const creator = initialGame.members?.find(m => m.creator === true);

      if (!creator) {
        throw new Error('Creator not found in game');
      }

      const existingMember = initialGame.members?.find(m => m.uid === currentUser.uid);

      if (!existingMember) {
        // Si moins de 2 membres, on ajoute le joueur
        if (initialGame.members.length < 2) {
          const currUser = {
            uid: currentUser.uid,
            piece: creator.piece === 'w' ? 'b' : 'w',
            name: localStorage.getItem('userName'),
            creator: false
          };

          await updateDoc(gameRef, {
            members: [...initialGame.members, currUser],
            status: 'ready'
          });
        } else {
          // Partie déjà complète
          return 'Game already started';
        }
      }

      // Configuration de l'écoute en temps réel
      unsubscribeSnapshot = onSnapshot(gameRef, (doc) => {
        const gameData = doc.data();
        if (gameData?.gameData) {
          chess.load(gameData.gameData);
        }
        updateGame();
      });

    } catch (error) {
      console.error("Error in game initialization:", error);
      throw error;
    }
  } else {
    // Jeu local
    const savedGame = localStorage.getItem('savedGame');
    if (savedGame) {
      chess.load(savedGame);
    }
    updateGame();
  }
}

export async function resetGame() {
  chess.reset();
  localStorage.removeItem('userName');
  if (currentGameRef) {
    updateDoc(currentGameRef, {
      gameData: chess.fen(),
      status: 'waiting',
      members: []
    }).catch(console.error);
  }
  updateGame();
}

export function handleMove(from, to, playerColor) {
  // Vérifie que c'est bien le tour du joueur
  if (playerColor && playerColor !== chess.turn()) {
    return; // Ignore le coup si ce n'est pas le tour du joueur
  }
  const promotions = chess.moves({ verbose: true }).filter(m => m.promotion);

  if (promotions.some(p => `${p.from}:${p.to}` === `${from}:${to}`)) {
    const pendingPromotion = { from, to, color: promotions[0].color };
    updateGame(pendingPromotion);
    return;
  }

  const { pendingPromotion } = gameSubject.getValue();
  if (!pendingPromotion) {
    move(from, to);
  }
}

export function move(from, to, promotion) {
  let tempMove = { from, to };
  if (promotion) {
    tempMove.promotion = promotion;
  }

  try {
    const legalMove = chess.move(tempMove);
    if (legalMove) {
      if (currentGameRef) {
        updateDoc(currentGameRef, {
          gameData: chess.fen()
        }).catch(console.error);
      }
      updateGame();
      return true;
    }
  } catch (e) {
    console.error('Invalid move', e);
  }
  return false;
}

function updateGame(pendingPromotion = null) {
  const isGameOver = chess.isGameOver();
  const gameState = {
    board: chess.board(),
    position: chess.turn(),
    pendingPromotion,
    isGameOver,
    result: isGameOver ? getGameResult() : null,
    fen: chess.fen()
  };

  localStorage.setItem('savedGame', chess.fen());
  gameSubject.next(gameState);
}


function getGameResult() {
  if (chess.isCheckmate()) {
    const winner = chess.turn() === 'w' ? 'BLACK' : 'WHITE';
    return `CHECKMATE - WINNER ${winner}`;
  } else if (chess.isDraw()) {
    let reason = '50 - Moves rule';
    
    if (chess.isStalemate()) {
      reason = 'STALEMATE';
    } else if (chess.isThreefoldRepetition()) {
      reason = 'REPETITION';
    } else if (chess.isInsufficientMaterial()) {
      reason = 'INSUFFICIENT MATERIAL';
    }
    return `DRAW - ${reason}`;
  } else {
    return 'UNKNOWN REASON';
  }
}
