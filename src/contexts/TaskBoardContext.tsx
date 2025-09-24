import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Board, Column, Task } from '../types';

interface TaskBoardState {
  boards: Board[];
  currentBoard: Board | null;
  searchTerm: string;
  priorityFilter: 'all' | 'high' | 'medium' | 'low';
  dueDateFilter: string;
}

type TaskBoardAction =
  | { type: 'SET_BOARDS'; payload: Board[] }
  | { type: 'ADD_BOARD'; payload: Board }
  | { type: 'UPDATE_BOARD'; payload: Board }
  | { type: 'DELETE_BOARD'; payload: string }
  | { type: 'SET_CURRENT_BOARD'; payload: Board | null }
  | { type: 'ADD_COLUMN'; payload: { boardId: string; column: Column } }
  | { type: 'UPDATE_COLUMN'; payload: { boardId: string; column: Column } }
  | { type: 'DELETE_COLUMN'; payload: { boardId: string; columnId: string } }
  | { type: 'ADD_TASK'; payload: { boardId: string; columnId: string; task: Task } }
  | { type: 'UPDATE_TASK'; payload: { boardId: string; task: Task } }
  | { type: 'DELETE_TASK'; payload: { boardId: string; taskId: string } }
  | { type: 'MOVE_TASK'; payload: { boardId: string; taskId: string; newColumnId: string; newPosition: number } }
  | { type: 'REORDER_TASK'; payload: { boardId: string; columnId: string; taskId: string; newPosition: number } }
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'SET_PRIORITY_FILTER'; payload: 'all' | 'high' | 'medium' | 'low' }
  | { type: 'SET_DATE_FILTER'; payload: string };

const initialState: TaskBoardState = {
  boards: [],
  currentBoard: null,
  searchTerm: '',
  priorityFilter: 'all',
  dueDateFilter: '',
};

const taskBoardReducer = (state: TaskBoardState, action: TaskBoardAction): TaskBoardState => {
  switch (action.type) {
    case 'SET_BOARDS':
      return { ...state, boards: action.payload };

    case 'ADD_BOARD':
      const newBoards = [...state.boards, action.payload];
      return { ...state, boards: newBoards };

    case 'UPDATE_BOARD':
      const updatedBoards = state.boards.map(board =>
        board.id === action.payload.id ? action.payload : board
      );
      return {
        ...state,
        boards: updatedBoards,
        currentBoard: state.currentBoard?.id === action.payload.id ? action.payload : state.currentBoard
      };

    case 'DELETE_BOARD':
      return {
        ...state,
        boards: state.boards.filter(board => board.id !== action.payload),
        currentBoard: state.currentBoard?.id === action.payload ? null : state.currentBoard
      };

    case 'SET_CURRENT_BOARD':
      return { ...state, currentBoard: action.payload };

    case 'ADD_COLUMN':
      return {
        ...state,
        boards: state.boards.map(board =>
          board.id === action.payload.boardId
            ? { ...board, columns: [...board.columns, action.payload.column] }
            : board
        ),
        currentBoard: state.currentBoard?.id === action.payload.boardId
          ? { ...state.currentBoard, columns: [...state.currentBoard.columns, action.payload.column] }
          : state.currentBoard
      };

    case 'UPDATE_COLUMN':
      return {
        ...state,
        boards: state.boards.map(board =>
          board.id === action.payload.boardId
            ? {
                ...board,
                columns: board.columns.map(col =>
                  col.id === action.payload.column.id ? action.payload.column : col
                )
              }
            : board
        ),
        currentBoard: state.currentBoard?.id === action.payload.boardId
          ? {
              ...state.currentBoard,
              columns: state.currentBoard.columns.map(col =>
                col.id === action.payload.column.id ? action.payload.column : col
              )
            }
          : state.currentBoard
      };

    case 'REORDER_TASK':
  return {
    ...state,
    boards: state.boards.map(board => {
      if (board.id !== action.payload.boardId) return board;
      
      return {
        ...board,
        columns: board.columns.map(col => {
          if (col.id !== action.payload.columnId) return col;
          
          const taskIndex = col.tasks.findIndex(task => task.id === action.payload.taskId);
          if (taskIndex === -1) return col;
          
          const taskToMove = col.tasks[taskIndex];
          const newTasks = [...col.tasks];
          
          newTasks.splice(taskIndex, 1);
          
          const insertIndex = Math.min(action.payload.newPosition, newTasks.length);
          newTasks.splice(insertIndex, 0, taskToMove);
          
          const reorderedTasks = newTasks.map((task, index) => ({
            ...task,
            position: index
          }));
          
          return { ...col, tasks: reorderedTasks };
        })
      };
    }),
    currentBoard: state.currentBoard?.id === action.payload.boardId
      ? {
          ...state.currentBoard,
          columns: state.currentBoard.columns.map(col => {
            if (col.id !== action.payload.columnId) return col;
            
            const taskIndex = col.tasks.findIndex(task => task.id === action.payload.taskId);
            if (taskIndex === -1) return col;
            
            const taskToMove = col.tasks[taskIndex];
            const newTasks = [...col.tasks];
            
            newTasks.splice(taskIndex, 1);
            
            const insertIndex = Math.min(action.payload.newPosition, newTasks.length);
            newTasks.splice(insertIndex, 0, taskToMove);
            
            const reorderedTasks = newTasks.map((task, index) => ({
              ...task,
              position: index
            }));
            
            return { ...col, tasks: reorderedTasks };
          })
        }
      : state.currentBoard
  };  

        case 'DELETE_COLUMN':
          return {
            ...state,
            boards: state.boards.map(board =>
              board.id === action.payload.boardId
                ? { ...board, columns: board.columns.filter(col => col.id !== action.payload.columnId) }
                : board
            ),
            currentBoard: state.currentBoard?.id === action.payload.boardId
              ? { ...state.currentBoard, columns: state.currentBoard.columns.filter(col => col.id !== action.payload.columnId) }
              : state.currentBoard
          };

        case 'ADD_TASK':
          return {
            ...state,
            boards: state.boards.map(board =>
              board.id === action.payload.boardId
                ? {
                    ...board,
                    columns: board.columns.map(col =>
                      col.id === action.payload.columnId
                        ? { ...col, tasks: [...col.tasks, action.payload.task] }
                        : col
                    )
                  }
                : board
            ),
            currentBoard: state.currentBoard?.id === action.payload.boardId
              ? {
                  ...state.currentBoard,
                  columns: state.currentBoard.columns.map(col =>
                    col.id === action.payload.columnId
                      ? { ...col, tasks: [...col.tasks, action.payload.task] }
                      : col
                  )
                }
              : state.currentBoard
          };

        case 'UPDATE_TASK':
          return {
            ...state,
            boards: state.boards.map(board =>
              board.id === action.payload.boardId
                ? {
                    ...board,
                    columns: board.columns.map(col => ({
                      ...col,
                      tasks: col.tasks.map(task =>
                        task.id === action.payload.task.id ? action.payload.task : task
                      )
                    }))
                  }
                : board
            ),
            currentBoard: state.currentBoard?.id === action.payload.boardId
              ? {
                  ...state.currentBoard,
                  columns: state.currentBoard.columns.map(col => ({
                    ...col,
                    tasks: col.tasks.map(task =>
                      task.id === action.payload.task.id ? action.payload.task : task
                    )
                  }))
                }
              : state.currentBoard
          };

    case 'DELETE_TASK':
      return {
        ...state,
        boards: state.boards.map(board =>
          board.id === action.payload.boardId
            ? {
                ...board,
                columns: board.columns.map(col => ({
                  ...col,
                  tasks: col.tasks.filter(task => task.id !== action.payload.taskId)
                }))
              }
            : board
        ),
        currentBoard: state.currentBoard?.id === action.payload.boardId
          ? {
              ...state.currentBoard,
              columns: state.currentBoard.columns.map(col => ({
                ...col,
                tasks: col.tasks.filter(task => task.id !== action.payload.taskId)
              }))
            }
          : state.currentBoard
      };

    case 'MOVE_TASK':
      return {
        ...state,
        boards: state.boards.map(board => {
          if (board.id !== action.payload.boardId) return board;
          
          const task = board.columns
            .flatMap(col => col.tasks)
            .find(t => t.id === action.payload.taskId);
          
          if (!task) return board;
          
          const updatedTask = { ...task, columnId: action.payload.newColumnId, position: action.payload.newPosition };
          
          return {
            ...board,
            columns: board.columns.map(col => {
              if (col.id === action.payload.newColumnId) {
                const tasksWithoutMoved = col.tasks.filter(t => t.id !== action.payload.taskId);
                tasksWithoutMoved.splice(action.payload.newPosition, 0, updatedTask);
                return { ...col, tasks: tasksWithoutMoved };
              }
              return { ...col, tasks: col.tasks.filter(t => t.id !== action.payload.taskId) };
            })
          };
        }),
        currentBoard: state.currentBoard?.id === action.payload.boardId
          ? (() => {
              const task = state.currentBoard.columns
                .flatMap(col => col.tasks)
                .find(t => t.id === action.payload.taskId);
              
              if (!task) return state.currentBoard;
              
              const updatedTask = { ...task, columnId: action.payload.newColumnId, position: action.payload.newPosition };
              
              return {
                ...state.currentBoard,
                columns: state.currentBoard.columns.map(col => {
                  if (col.id === action.payload.newColumnId) {
                    const tasksWithoutMoved = col.tasks.filter(t => t.id !== action.payload.taskId);
                    tasksWithoutMoved.splice(action.payload.newPosition, 0, updatedTask);
                    return { ...col, tasks: tasksWithoutMoved };
                  }
                  return { ...col, tasks: col.tasks.filter(t => t.id !== action.payload.taskId) };
                })
              };
            })()
          : state.currentBoard
      };

    case 'SET_SEARCH_TERM':
      return { ...state, searchTerm: action.payload };

    case 'SET_PRIORITY_FILTER':
      return { ...state, priorityFilter: action.payload };

    case 'SET_DATE_FILTER':
      return { ...state, dueDateFilter: action.payload };

    default:
      return state;
  }
};

const TaskBoardContext = createContext<{
  state: TaskBoardState;
  dispatch: React.Dispatch<TaskBoardAction>;
} | null>(null);

export const TaskBoardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(taskBoardReducer, initialState);

  useEffect(() => {
    const savedBoards = localStorage.getItem('taskBoardData');
    if (savedBoards) {
      try {
        const boards = JSON.parse(savedBoards);
        dispatch({ type: 'SET_BOARDS', payload: boards });
      } catch (error) {
        console.error('Error loading boards from localStorage:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('taskBoardData', JSON.stringify(state.boards));
  }, [state.boards]);

  return (
    <TaskBoardContext.Provider value={{ state, dispatch }}>
      {children}
    </TaskBoardContext.Provider>
  );
};

export const useTaskBoard = () => {
  const context = useContext(TaskBoardContext);
  if (!context) {
    throw new Error('useTaskBoard must be used within a TaskBoardProvider');
  }
  return context;
};