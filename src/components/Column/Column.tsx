import React, { useState, useRef } from 'react';
import { Column as ColumnType, Task } from '../../types';
import TaskCard from '../Task/TaskCard';
import TaskModalComponent from '../Task/TaskModal';
import { useTaskBoard } from '../../contexts/TaskBoardContext';
import { generateId } from '../../utils/helpers';

interface ColumnComponentProps {
  column: ColumnType;
  boardId: string;
  filteredTasks: Task[];
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, columnId: string) => void;
  onDragStart: (e: React.DragEvent, task: Task) => void;
  onDragEnd: () => void;
}

const ColumnComponent: React.FC<ColumnComponentProps> = ({ 
  column, 
  boardId, 
  filteredTasks,
  onDragOver: parentDragOver, 
  onDrop: parentDrop, 
  onDragStart, 
  onDragEnd 
}) => {
  const { dispatch } = useTaskBoard();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showEditColumn, setShowEditColumn] = useState(false);
  const [columnTitle, setColumnTitle] = useState(column.title);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleCreateTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'position'>) => {
    const newTask: Task = {
      ...taskData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      position: column.tasks.length
    };
    dispatch({ type: 'ADD_TASK', payload: { boardId, columnId: column.id, task: newTask } });
  };

  const handleUpdateTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'position'>) => {
    if (!editingTask) return;
    const updatedTask: Task = { ...editingTask, ...taskData };
    dispatch({ type: 'UPDATE_TASK', payload: { boardId, task: updatedTask } });
    setEditingTask(null);
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      dispatch({ type: 'DELETE_TASK', payload: { boardId, taskId } });
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleUpdateColumn = () => {
    if (!columnTitle.trim()) {
      alert('Column title cannot be empty');
      return;
    }
    const updatedColumn: ColumnType = { ...column, title: columnTitle.trim() };
    dispatch({ type: 'UPDATE_COLUMN', payload: { boardId, column: updatedColumn } });
    setShowEditColumn(false);
  };

  const handleDeleteColumn = () => {
    if (column.tasks.length > 0 && 
      !window.confirm('This column has tasks. Are you sure you want to delete it? All tasks will be lost.')
    ) return;
    dispatch({ type: 'DELETE_COLUMN', payload: { boardId, columnId: column.id } });
  };

  const getInsertionIndex = (e: React.DragEvent): number => {
    if (!containerRef.current) return filteredTasks.length;
    const mouseY = e.clientY;
    const taskElements = containerRef.current.querySelectorAll('[data-task-id]');
    for (let i = 0; i < taskElements.length; i++) {
      const taskRect = (taskElements[i] as HTMLElement).getBoundingClientRect();
      if (mouseY < taskRect.top + taskRect.height / 2) return i;
    }
    return filteredTasks.length;
  };

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.setData('application/json', JSON.stringify({ taskId: task.id, sourceColumnId: column.id, boardId }));
    e.dataTransfer.effectAllowed = 'move';
    onDragStart(e, task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    const insertionIndex = getInsertionIndex(e);
    setDragOverIndex(insertionIndex);
    setIsDraggingOver(true);
    parentDragOver(e);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setDragOverIndex(null);
      setIsDraggingOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    const dragData = e.dataTransfer.getData('application/json');
    let sourceColumnId = column.id;
    try {
      sourceColumnId = JSON.parse(dragData).sourceColumnId;
    } catch {}
    const insertionIndex = getInsertionIndex(e);
    if (sourceColumnId === column.id) {
      const currentIndex = filteredTasks.findIndex(task => task.id === taskId);
      if (currentIndex !== -1 && currentIndex !== insertionIndex) {
        let newPosition = currentIndex < insertionIndex ? insertionIndex - 1 : insertionIndex;
        dispatch({ type: 'REORDER_TASK', payload: { boardId, columnId: column.id, taskId, newPosition } });
      }
    } else {
      dispatch({ type: 'MOVE_TASK', payload: { boardId, taskId, newColumnId: column.id, newPosition: insertionIndex } });
    }
    setDragOverIndex(null);
    setIsDraggingOver(false);
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-4 w-80 flex-shrink-0 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        {showEditColumn ? (
          <input
            type="text"
            value={columnTitle}
            onChange={(e) => setColumnTitle(e.target.value)}
            className="flex-1 px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleUpdateColumn();
              if (e.key === 'Escape') { setColumnTitle(column.title); setShowEditColumn(false); }
            }}
            onBlur={handleUpdateColumn}
            autoFocus
          />
        ) : (
          <div className="flex items-center gap-2 flex-1">
            <h3 className="font-semibold text-indigo-700">{column.title}</h3>
            <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full font-medium">
              {filteredTasks.length}
            </span>
          </div>
        )}

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowEditColumn(!showEditColumn)}
            className="text-gray-400 hover:text-indigo-600 p-1 rounded transition"
            title="Edit column"
          >
            ✏️
          </button>
          <button
            onClick={handleDeleteColumn}
            className="text-gray-400 hover:text-red-600 p-1 rounded transition"
            title="Delete column"
          >
            🗑️
          </button>
        </div>
      </div>

      <button
        onClick={() => { setEditingTask(null); setShowTaskModal(true); }}
        className="w-full mb-4 px-3 py-2 text-sm font-medium rounded-lg 
                   bg-gradient-to-r from-indigo-400 to-purple-400 hover:from-indigo-500 hover:via-purple-500 hover:to-purple-400
                   flex items-center justify-center gap-2 transition"
      >
        ➕ Add Task
      </button>

      <div
        ref={containerRef}
        className={`min-h-[200px] space-y-2 p-2 rounded-lg transition-all duration-200 ${
          isDraggingOver ? 'bg-blue-50 border-2 border-dashed border-blue-300' : 'bg-gray-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {filteredTasks.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <div className="w-12 h-12 mx-auto mb-3 bg-indigo-100 text-indigo-500 flex items-center justify-center rounded-full">
              📭
            </div>
            <p className="text-sm font-medium">No tasks yet</p>
          </div>
        ) : (
          <>
            {dragOverIndex === 0 && <div className="h-1 bg-blue-400 rounded-full mx-2" />}
            {filteredTasks.map((task, index) => (
              <div key={task.id}>
                <div data-task-id={task.id}>
                  <TaskCard
                    task={task}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                    onDragStart={handleDragStart}
                    onDragEnd={onDragEnd}
                  />
                </div>
                {dragOverIndex === index + 1 && <div className="h-1 bg-blue-400 rounded-full mx-2 my-2" />}
              </div>
            ))}
          </>
        )}
      </div>

      <TaskModalComponent
        isOpen={showTaskModal}
        onClose={() => { setShowTaskModal(false); setEditingTask(null); }}
        onSave={editingTask ? handleUpdateTask : handleCreateTask}
        task={editingTask}
        columnId={column.id}
      />
    </div>
  );
};

export default ColumnComponent;
