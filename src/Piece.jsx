import React from "react";
import {useDrag, DragPreviewImage} from 'react-dnd'

export default function Piece({piece:{ type, color },position}) {
    

const [ {isDragging},drag,preview] = useDrag ({

    type:'PIECE',
    item: {type: 'piece', id: `${position}_${type}_${color}` },
    collect:(monitor)=>{
        return{ isDragging: !!monitor.isDragging() }
    }
})

  const pieceImg = new URL(`./assets/${type}_${color}.png`, import.meta.url).href;

  return (
    <>
    <DragPreviewImage connect ={preview} src={pieceImg}/>
    <div
     className="piece-container" 
    ref={drag}
    style={{opacity:isDragging ? 0 : 1 }}
    >
      <img src={pieceImg} alt={`${color} ${type}`} className="piece"/>
    </div>
    </>
  );
}