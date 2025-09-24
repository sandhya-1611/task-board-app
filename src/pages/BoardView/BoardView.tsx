import React, { useState } from 'react';
import { useTaskBoard } from '../../contexts/TaskBoardContext';
import { Board } from '../../types';
import { generateId, formatDateTime } from '../../utils/helpers';

interface BoardViewProps {
  onBoardSelect: (board: Board) => void;
}

const BoardView: React.FC<BoardViewProps> = ({ onBoardSelect }) => {
  const { state, dispatch } = useTaskBoard();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    createdBy: ''
  });

  const handleCreateBoard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.createdBy.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const newBoard: Board = {
      id: generateId(),
      title: formData.title.trim(),
      description: formData.description.trim(),
      createdBy: formData.createdBy.trim(),
      createdAt: new Date().toISOString(),
      columns: []
    };

    dispatch({ type: 'ADD_BOARD', payload: newBoard });
    setFormData({ title: '', description: '', createdBy: '' });
    setShowCreateModal(false);
  };

  const handleDeleteBoard = (boardId: string) => {
    if (window.confirm('Are you sure you want to delete this board? This action cannot be undone.')) {
      dispatch({ type: 'DELETE_BOARD', payload: boardId });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 px-6 py-6 shadow-lg rounded-2xl mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-white drop-shadow-lg">Task Boards</h1>
            <p className="text-indigo-100 italic mt-1">Organize your projects and collaborate with your team</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-purple-500 hover:via-purple-500 hover:to-purple-400 text-white px-6 py-3 rounded-lg font-semibold text-sm shadow-md transition-all flex items-center gap-2 transform hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Create Board
          </button>
        </div>

        {state.boards.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-lg">
            <div className="w-20 h-20 bg-gradient-to-r from-indigo-400 to-pink-400 rounded-full mx-auto mb-6 flex items-center justify-center shadow-md">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No boards available</h3>
            <p className="text-gray-500 mb-6">Start by creating your first board to manage tasks effectively</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transform hover:scale-105 transition-all"
            >
              Create Your First Board
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold uppercase tracking-wide">Board</th>
                    <th className="px-6 py-4 text-left font-semibold uppercase tracking-wide">Description</th>
                    <th className="px-6 py-4 text-left font-semibold uppercase tracking-wide">Created By</th>
                    <th className="px-6 py-4 text-left font-semibold uppercase tracking-wide">Columns</th>
                    <th className="px-6 py-4 text-left font-semibold uppercase tracking-wide">Tasks</th>
                    <th className="px-6 py-4 text-left font-semibold uppercase tracking-wide">Created</th>
                    <th className="px-6 py-4 text-left font-semibold uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {state.boards.map((board) => {
                    const totalTasks = board.columns.reduce((sum, col) => sum + col.tasks.length, 0);
                    return (
                      <tr
                        key={board.id}
                        className="hover:bg-indigo-50 transition-all cursor-pointer even:bg-gray-50 transform hover:scale-[1.01]"
                      >
                        <td className="px-6 py-4 font-medium text-gray-900" onClick={() => onBoardSelect(board)}>
                          {board.title}
                        </td>
                        <td className="px-6 py-4 text-gray-600 max-w-sm truncate" onClick={() => onBoardSelect(board)}>
                          {board.description || 'No description'}
                        </td>
                        <td className="px-6 py-4 text-gray-600" onClick={() => onBoardSelect(board)}>
                          {board.createdBy}
                        </td>
                        <td className="px-6 py-4" onClick={() => onBoardSelect(board)}>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full shadow-sm">
                            {board.columns.length} Columns
                          </span>
                        </td>
                        <td className="px-6 py-4" onClick={() => onBoardSelect(board)}>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full shadow-sm">
                            {totalTasks} Tasks
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500" onClick={() => onBoardSelect(board)}>
                          {formatDateTime(board.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-right space-x-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onBoardSelect(board);
                            }}
                            className="text-indigo-600 hover:text-pink-500 font-semibold transition-all"
                          >
                            Open
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBoard(board.id);
                            }}
                            className="text-red-600 hover:text-red-700 font-semibold transition-all hover:scale-105"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 animate-fade-in">
              <h2 className="text-2xl font-extrabold mb-4 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                Create New Board
              </h2>
              <form onSubmit={handleCreateBoard} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Board Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full border border-indigo-200 rounded-md px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm"
                    placeholder="Enter board title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border border-indigo-200 rounded-md px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm"
                    rows={3}
                    placeholder="Optional description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created By *</label>
                  <input
                    type="text"
                    value={formData.createdBy}
                    onChange={(e) => setFormData({ ...formData, createdBy: e.target.value })}
                    className="w-full border border-indigo-200 rounded-md px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setFormData({ title: '', description: '', createdBy: '' });
                    }}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md transition shadow-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-purple-600 hover:to-pink-500 text-white px-6 py-2 rounded-md font-semibold shadow-md transition-all transform hover:scale-105"
                  >
                    Create Board
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BoardView;
