import React, { useState, useEffect } from 'react';
import { Board, Column as ColumnType, Task } from '../../types';
import { useTaskBoard } from '../../contexts/TaskBoardContext';
import ColumnComponent from '../../components/Column/Column';
import { generateId } from '../../utils/helpers';

interface BoardDetailProps {
  board: Board;
  onBackToBoards: () => void;
}

const BoardDetail: React.FC<BoardDetailProps> = ({ board, onBackToBoards }) => {
  const { state, dispatch } = useTaskBoard();
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  useEffect(() => {
    dispatch({ type: 'SET_CURRENT_BOARD', payload: board });
  }, [board, dispatch]);

  const currentBoard = state.currentBoard || board;

  const handleAddColumn = () => {
    if (!newColumnTitle.trim()) {
      alert('Column title cannot be empty');
      return;
    }
    const newColumn: ColumnType = {
      id: generateId(),
      title: newColumnTitle.trim(),
      boardId: currentBoard.id,
      position: currentBoard.columns.length,
      tasks: []
    };
    dispatch({ type: 'ADD_COLUMN', payload: { boardId: currentBoard.id, column: newColumn } });
    setNewColumnTitle('');
    setShowAddColumn(false);
  };

  const getFilteredTasks = (columnTasks: Task[]) =>
    columnTasks.filter(task => {
      const matchesSearch =
        !state.searchTerm ||
        task.title.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(state.searchTerm.toLowerCase());
      const matchesPriority =
        state.priorityFilter === 'all' || task.priority === state.priorityFilter;
      const matchesDate =
        !state.dueDateFilter || task.dueDate.split('T')[0] === state.dueDateFilter;
      return matchesSearch && matchesPriority && matchesDate;
    });

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    if (!draggedTask) return;
    if (draggedTask.columnId === targetColumnId) {
      setDraggedTask(null);
      return;
    }
    const targetColumn = currentBoard.columns.find(col => col.id === targetColumnId);
    const newPosition = targetColumn ? targetColumn.tasks.length : 0;
    dispatch({
      type: 'MOVE_TASK',
      payload: {
        boardId: currentBoard.id,
        taskId: draggedTask.id,
        newColumnId: targetColumnId,
        newPosition
      }
    });
    setDraggedTask(null);
  };
  const handleDragEnd = () => setDraggedTask(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 px-6 py-6 shadow-lg rounded-b-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToBoards}
              className="text-white hover:text-yellow-200 flex items-center gap-2 transition-all font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Boards
            </button>
            <div>
              <h1 className="text-3xl font-extrabold text-white drop-shadow-lg">
                {currentBoard.title}
              </h1>
              {currentBoard.description && (
                <p className="text-indigo-100 italic mt-1">{currentBoard.description}</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-md flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="🔍 Search tasks..."
            value={state.searchTerm}
            onChange={(e) => dispatch({ type: 'SET_SEARCH_TERM', payload: e.target.value })}
            className="flex-1 min-w-64 px-4 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all shadow-sm"
          />
          <select
            value={state.priorityFilter}
            onChange={(e) => dispatch({ type: 'SET_PRIORITY_FILTER', payload: e.target.value as any })}
            className="px-4 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white transition-all shadow-sm"
          >
            <option value="all">All Priorities</option>
            <option value="high">🔥 High Priority</option>
            <option value="medium">⚡ Medium Priority</option>
            <option value="low">🌱 Low Priority</option>
          </select>
          <input
            type="date"
            value={state.dueDateFilter}
            onChange={(e) => dispatch({ type: 'SET_DATE_FILTER', payload: e.target.value })}
            className="px-4 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white transition-all shadow-sm"
            title="Filter by due date"
          />
          {(state.searchTerm || state.priorityFilter !== 'all' || state.dueDateFilter) && (
            <button
              onClick={() => {
                dispatch({ type: 'SET_SEARCH_TERM', payload: '' });
                dispatch({ type: 'SET_PRIORITY_FILTER', payload: 'all' });
                dispatch({ type: 'SET_DATE_FILTER', payload: '' });
              }}
              className="px-4 py-2 text-indigo-600 hover:text-pink-500 font-semibold transition-all"
            >
              ✖ Clear Filters
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        <div className="flex gap-6 overflow-x-auto pb-4">
          {currentBoard.columns.map((column) => (
            <div
              key={column.id}
              className="transform transition-all hover:scale-[1.02] hover:shadow-2xl rounded-xl"
            >
              <ColumnComponent
                column={column}
                boardId={currentBoard.id}
                filteredTasks={getFilteredTasks(column.tasks)}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              />
            </div>
          ))}

          <div className="w-80 flex-shrink-0">
            {showAddColumn ? (
              <div className="bg-white rounded-xl p-4 border-2 border-dashed border-indigo-400 shadow-md">
                <input
                  type="text"
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  placeholder="Enter column title"
                  className="w-full px-3 py-2 mb-3 border border-indigo-200 rounded-md focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddColumn();
                    if (e.key === 'Escape') {
                      setShowAddColumn(false);
                      setNewColumnTitle('');
                    }
                  }}
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddColumn}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-500 font-semibold shadow-md transition-all"
                  >
                    Add Column
                  </button>
                  <button
                    onClick={() => {
                      setShowAddColumn(false);
                      setNewColumnTitle('');
                    }}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all shadow-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddColumn(true)}
                className="w-full h-32 border-2 border-dashed border-indigo-400 rounded-xl text-indigo-400 hover:border-indigo-600 hover:text-indigo-600 transition-all flex items-center justify-center gap-2 font-semibold"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Add a column
              </button>
            )}
          </div>
        </div>

        {currentBoard.columns.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gradient-to-r from-indigo-400 to-pink-400 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0-00-2 2" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No columns yet</h3>
            <p className="text-gray-500 mb-6">Create your first column to start organizing tasks</p>
            <button
              onClick={() => setShowAddColumn(true)}
              className="bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transform hover:scale-105 transition-all"
            >
              Create Your First Column
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BoardDetail;
