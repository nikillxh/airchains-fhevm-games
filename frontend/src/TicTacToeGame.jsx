import { useState, useEffect } from "react";
import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0x00d06D3b6fF03fc136646f4e1137B374d3Aa9754";
const ABI = [
  "function makeMove(uint8 index) external",
  "function getBoard() external view returns (uint8[9])",
  "function winner() external view returns (address)",
  "function gameActive() external view returns (bool)",
];

function Square({ value, onSquareClick }) {
  return (
    <button className="square" onClick={onSquareClick}>
      {value}
    </button>
  );
}

function Board({ squares, onPlay }) {
  return (
    <>
      <div className="board-row">
        <Square value={squares[0]} onSquareClick={() => onPlay(0)} />
        <Square value={squares[1]} onSquareClick={() => onPlay(1)} />
        <Square value={squares[2]} onSquareClick={() => onPlay(2)} />
      </div>
      <div className="board-row">
        <Square value={squares[3]} onSquareClick={() => onPlay(3)} />
        <Square value={squares[4]} onSquareClick={() => onPlay(4)} />
        <Square value={squares[5]} onSquareClick={() => onPlay(5)} />
      </div>
      <div className="board-row">
        <Square value={squares[6]} onSquareClick={() => onPlay(6)} />
        <Square value={squares[7]} onSquareClick={() => onPlay(7)} />
        <Square value={squares[8]} onSquareClick={() => onPlay(8)} />
      </div>
    </>
  );
}

export default function Game({ provider }) {
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [gameActive, setGameActive] = useState(true);
  const [winner, setWinner] = useState(null);
  const [contract, setContract] = useState(null);
  const [signer, setSigner] = useState(null);

  useEffect(() => {
    if (provider) {
      async function setupContract() {
        const signerInstance = await provider.getSigner();
        const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, ABI, signerInstance);
        setSigner(signerInstance);
        setContract(contractInstance);
        fetchGameState(contractInstance);
      }
      setupContract();
    }
  }, [provider]);

  async function fetchGameState(contractInstance) {
    try {
      const boardData = await contractInstance.getBoard();
      const mappedBoard = boardData.map(cell => (cell === 1 ? "X" : cell === 2 ? "O" : null));
      setSquares(mappedBoard);

      const isActive = await contractInstance.gameActive();
      setGameActive(isActive);

      const gameWinner = await contractInstance.winner();
      setWinner(gameWinner !== ethers.ZeroAddress ? gameWinner : null);
      setXIsNext(mappedBoard.filter(v => v !== null).length % 2 === 0);
    } catch (error) {
      console.error("Error fetching game state:", error);
    }
  }

  async function handleMove(index) {
    if (!gameActive || squares[index] !== null) return;
  
    try {
      const tx = await contract.makeMove(index);
      console.log("Transaction Sent:", tx);
      const receipt = await tx.wait();
      console.log("Transaction Receipt:", receipt);
  
      fetchGameState(contract); // After transaction is mined, update the state
    } catch (error) {
      console.error("Move Failed:", error);
      alert("Move failed! Either invalid or transaction error.");
    }
  }

  return (
    <div className="game">
      <div className="status">
        {winner ? `Winner: ${winner}` : gameActive ? `Next Player: ${xIsNext ? "X" : "O"}` : "Game Over"}
      </div>
      <div className="game-board">
        <Board squares={squares} onPlay={handleMove} />
      </div>
    </div>
  );
}
