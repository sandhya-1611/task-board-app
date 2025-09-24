import React, { useState } from 'react';
import { TaskBoardProvider } from './contexts/TaskBoardContext';
import BoardView from './pages/BoardView/BoardView';
import BoardDetail from './pages/BoardDetail/BoardDetail';
import { Board } from './types';

function App() {
  const [currentView, setCurrentView] = useState<'boards' | 'board-detail'>('boards');
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);

  const handleBoardSelect = (board: Board) => {
    setSelectedBoard(board);
    setCurrentView('board-detail');
  };

  const handleBackToBoards = () => {
    setSelectedBoard(null);
    setCurrentView('boards');
  };

  return (
    <TaskBoardProvider>
      <div className="App">
        {currentView === 'boards' ? (
          <BoardView onBoardSelect={handleBoardSelect} />
        ) : selectedBoard ? (
          <BoardDetail 
            board={selectedBoard} 
            onBackToBoards={handleBackToBoards} 
          />
        ) : null}
      </div>
    </TaskBoardProvider>
  );
}

export default App;