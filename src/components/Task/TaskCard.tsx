import React, { useState } from 'react';
import { Task } from '../../types';
import { formatDate, getPriorityColor, getDueDateStatus, truncateText } from '../../utils/helpers';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onDragStart: (e: React.DragEvent, task: Task) => void;
  onDragEnd: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onDragStart, onDragEnd }) => {
  const [isDragging, setIsDragging] = useState(false);
  const dueDateStatus = getDueDateStatus(task.dueDate);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    onDragStart(e, task);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    onDragEnd();
  };

  const getDueDateColor = () => {
    switch (dueDateStatus) {
      case 'overdue':
        return 'text-red-700 bg-red-100 border-red-300';
      case 'today':
        return 'text-orange-700 bg-orange-100 border-orange-300';
      default:
        return 'text-indigo-700 bg-indigo-50 border-indigo-200';
    }
  };

  const getPriorityIcon = () => {
    switch (task.priority) {
      case 'high':
        return (
          <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 
              001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'medium':
        return (
          <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'low':
        return (
          <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 2a8 8 0 100 16 8 8 0 000-16zM6.293 9.293a1 1 0 
              011.414 0L9 10.586V7a1 1 0 112 0v3.586l1.293-1.293a1 1 0 
              111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`group relative bg-white border rounded-xl p-4 shadow-sm transition-all duration-200 cursor-move select-none ${
        isDragging
          ? 'opacity-70 shadow-lg border-indigo-400 ring-2 ring-indigo-300'
          : 'hover:shadow-md hover:border-indigo-300 border-gray-200'
      }`}
    >
      <div
        className={`absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 transition-opacity duration-200 ${
          !isDragging ? 'group-hover:opacity-100' : ''
        }`}
      >
        <div className="flex flex-col space-y-1">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-1 h-1 bg-gray-400 rounded-full"></div>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-start mb-3">
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full border shadow-sm ${getPriorityColor(
            task.priority
          )}`}
        >
          {getPriorityIcon()}
          {task.priority.toUpperCase()}
        </span>
        <div
          className={`flex gap-1 opacity-0 transition-opacity duration-200 ${
            !isDragging ? 'group-hover:opacity-100' : ''
          }`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="text-indigo-500 hover:text-indigo-700 transition-colors p-1 rounded-lg hover:bg-indigo-50"
            title="Edit task"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 
                002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 
                0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            className="text-red-500 hover:text-red-700 transition-colors p-1 rounded-lg hover:bg-red-50"
            title="Delete task"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 
                0116.138 21H7.862a2 2 0 
                01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 
                1 0 00-1-1h-4a1 1 0 
                00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      <h3
        className="font-semibold text-gray-900 mb-2 leading-tight break-words"
        title={task.title}
      >
        {truncateText(task.title, 50)}
      </h3>

      {task.description && (
        <p
          className="text-sm text-gray-600 mb-3 leading-relaxed break-words whitespace-pre-wrap"
          title={task.description}
        >
          {truncateText(task.description, 100)}
        </p>
      )}

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 text-gray-500">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M16 7a4 4 0 
              11-8 0 4 4 0 018 0zM12 14a7 7 0 
              00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span className="font-medium text-indigo-600">{truncateText(task.createdBy, 12)}</span>
        </div>

        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-semibold ${getDueDateColor()}`}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 7V3m8 4V3m-9 
              8h10M5 21h14a2 2 0 002-2V7a2 2 
              0 00-2-2H5a2 2 0 
              00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>{formatDate(task.dueDate)}</span>
          {dueDateStatus === 'overdue' && (
            <span className="inline-flex items-center justify-center w-4 h-4 bg-red-600 text-white rounded-full text-xs font-bold">
              !
            </span>
          )}
          {dueDateStatus === 'today' && (
            <span className="inline-flex items-center justify-center w-4 h-4 bg-orange-500 text-white rounded-full text-xs">
              •
            </span>
          )}
        </div>
      </div>

      {isDragging && (
        <div className="absolute inset-0 bg-indigo-100 rounded-lg opacity-30 pointer-events-none" />
      )}
    </div>
  );
};

export default TaskCard;
