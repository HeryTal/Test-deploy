import React,{useEffect,useState} from "react";
import Square from "./Square";
import Piece from "./Piece";
import { useDrop } from "react-dnd";
import { gameSubject, handleMove } from "./Game";
import Promote from "./promote";



export default function BoardSquare({ piece, black, position, playerColor }) {

    const [promotion,setPromotion] = useState(null)


  const [, drop] = useDrop({
    accept: 'PIECE',
    drop: (item) => {
      const [fromPosition] = item.id.split('_');
      handleMove(fromPosition, position, playerColor);
    },
  });


  useEffect(()=>{
    const subscribe = gameSubject.subscribe(({pendingPromotion})=>
         pendingPromotion && pendingPromotion.to === position 
        ? setPromotion(pendingPromotion)
        :setPromotion(null) 

    )
    return() => subscribe.unsubscribe()
  },[position])

  return (
    <div ref={drop} className="board-square">
      <Square black={black}>
        {promotion ? (
          <Promote promotion={promotion} />
        ) : piece ? (
          <Piece piece={piece} position={position} />
        ) : (
          <div className="piece-container">&nbsp;</div>
        )}
      </Square>
    </div>
  );
}