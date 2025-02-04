// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract TicTacToe {
    address public player1;
    address public player2;
    address public winner;
    uint8 public turn; // 1 for player1, 2 for player2
    bool public gameActive;

    uint8[3][3] public board; // 0 = empty, 1 = player1, 2 = player2

    event GameStarted(address player1, address player2);
    event MoveMade(address player, uint8 row, uint8 col);
    event GameEnded(address winner);
    event GameDraw();

    modifier onlyPlayers() {
        require(msg.sender == player1 || msg.sender == player2, "Not a player");
        _;
    }

    modifier validMove(uint8 row, uint8 col) {
        require(gameActive, "Game is not active");
        require(board[row][col] == 0, "Cell is occupied");
        require((turn == 1 && msg.sender == player1) || (turn == 2 && msg.sender == player2), "Not your turn");
        _;
    }

    constructor(address _player2) {
        player1 = msg.sender;
        player2 = _player2;
        turn = 1; // Player1 starts
        gameActive = true;
        emit GameStarted(player1, player2);
    }

    function makeMove(uint8 row, uint8 col) external onlyPlayers validMove(row, col) {
        board[row][col] = turn;
        emit MoveMade(msg.sender, row, col);

        if (checkWin(turn)) {
            winner = msg.sender;
            gameActive = false;
            emit GameEnded(winner);
        } else if (isBoardFull()) {
            gameActive = false;
            emit GameDraw();
        } else {
            turn = (turn == 1) ? 2 : 1; // Switch turn
        }
    }

    function checkWin(uint8 player) internal view returns (bool) {
        for (uint8 i = 0; i < 3; i++) {
            if (board[i][0] == player && board[i][1] == player && board[i][2] == player) return true; // Rows
            if (board[0][i] == player && board[1][i] == player && board[2][i] == player) return true; // Columns
        }
        if (board[0][0] == player && board[1][1] == player && board[2][2] == player) return true; // Diagonal
        if (board[0][2] == player && board[1][1] == player && board[2][0] == player) return true; // Reverse Diagonal
        return false;
    }

    function isBoardFull() internal view returns (bool) {
        for (uint8 i = 0; i < 3; i++) {
            for (uint8 j = 0; j < 3; j++) {
                if (board[i][j] == 0) return false;
            }
        }
        return true;
    }

    function getBoard() external view returns (uint8[3][3] memory) {
        return board;
    }
}
