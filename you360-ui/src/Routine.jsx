import React, { useState } from 'react';
import { PlusCircleIcon, TrashIcon, SunIcon, CloudIcon, MoonIcon, HeartIcon, CheckCircleIcon, PencilSquareIcon } from '@heroicons/react/24/solid';

const App = () => {
  const [routines, setRoutines] = useState([
    {
      id: 1,
      name: 'Morning Habits',
      timeOfDay: 'Morning',
      tasks: ['Wake up', 'Drink water'],
      completed: [false, false],
    },
    {
      id: 2,
      name: 'Afternoon Workout',
      timeOfDay: 'Afternoon',
      tasks: ['20 push-ups', '30 sit-ups', '10 squats'],
      completed: [false, false, false],
    },
    {
      id: 3,
      name: 'Evening Chill',
      timeOfDay: 'Evening',
      tasks: ['Read a book', 'Eat dinner'],
      completed: [false, false],
    },
    {
      id: 4,
      name: 'Yoga & Meditation',
      timeOfDay: 'Wellness',
      tasks: ['10-minute meditation', 'Gentle stretches'],
      completed: [false, false],
    },
  ]);
  const [newRoutineName, setNewRoutineName] = useState('');
  const [newRoutineTasks, setNewRoutineTasks] = useState('');
  const [newRoutineTime, setNewRoutineTime] = useState('Morning');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRoutineId, setEditingRoutineId] = useState(null);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (newRoutineName.trim() === '' || newRoutineTasks.trim() === '') return;

    if (editingRoutineId) {
      // Edit existing routine
      setRoutines(
        routines.map((routine) =>
          routine.id === editingRoutineId
            ? {
                ...routine,
                name: newRoutineName,
                timeOfDay: newRoutineTime,
                tasks: newRoutineTasks.split(',').map((task) => task.trim()),
                completed: newRoutineTasks.split(',').map(() => false),
              }
            : routine
        )
      );
      setEditingRoutineId(null);
    } else {
      // Add new routine
      const newRoutine = {
        id: routines.length + 1,
        name: newRoutineName,
        timeOfDay: newRoutineTime,
        tasks: newRoutineTasks.split(',').map((task) => task.trim()),
        completed: newRoutineTasks.split(',').map(() => false),
      };
      setRoutines([...routines, newRoutine]);
    }

    setNewRoutineName('');
    setNewRoutineTasks('');
    setShowAddForm(false);
  };

  const handleToggleTask = (routineId, taskIndex) => {
    setRoutines(
      routines.map((routine) =>
        routine.id === routineId
          ? {
              ...routine,
              completed: routine.completed.map((completed, index) =>
                index === taskIndex ? !completed : completed
              ),
            }
          : routine
      )
    );
  };

  const handleDeleteRoutine = (routineId) => {
    setRoutines(routines.filter((routine) => routine.id !== routineId));
  };

  const handleEditRoutine = (routine) => {
    setNewRoutineName(routine.name);
    setNewRoutineTasks(routine.tasks.join(', '));
    setNewRoutineTime(routine.timeOfDay);
    setEditingRoutineId(routine.id);
    setShowAddForm(true);
  };

  const getProgress = (routine) => {
    const totalTasks = routine.tasks.length;
    const completedTasks = routine.completed.filter(Boolean).length;
    return totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  };

  const getTotalProgress = () => {
    const totalTasks = routines.reduce((sum, routine) => sum + routine.tasks.length, 0);
    const completedTasks = routines.reduce((sum, routine) => sum + routine.completed.filter(Boolean).length, 0);
    return totalTasks > 0 ? Math.floor((completedTasks / totalTasks) * 100) : 0;
  };
  
  const totalProgress = getTotalProgress();

  const morningRoutines = routines.filter(r => r.timeOfDay === 'Morning');
  const afternoonRoutines = routines.filter(r => r.timeOfDay === 'Afternoon');
  const eveningRoutines = routines.filter(r => r.timeOfDay === 'Evening');
  const wellnessRoutines = routines.filter(r => r.timeOfDay === 'Wellness');

  const renderRoutineCard = (routine) => {
    const progress = getProgress(routine);
    return (
      <div key={routine.id} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 transition-all duration-300 transform hover:scale-105">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-purple-700">{routine.name}</h3>
          <div className="flex space-x-2">
            <button onClick={() => handleEditRoutine(routine)} className="text-gray-500 hover:text-gray-700">
              <PencilSquareIcon className="h-5 w-5" />
            </button>
            <button onClick={() => handleDeleteRoutine(routine.id)} className="text-red-500 hover:text-red-700">
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <div
            className="bg-pink-500 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <ul className="space-y-2">
          {routine.tasks.map((task, index) => (
            <li
              key={index}
              onClick={() => handleToggleTask(routine.id, index)}
              className={`flex items-center cursor-pointer p-2 rounded-lg transition-all duration-200
              ${routine.completed[index] ? 'bg-green-100 text-green-700 line-through' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
            >
              <CheckCircleIcon className={`h-5 w-5 mr-2 transition-colors ${routine.completed[index] ? 'text-green-500' : 'text-gray-400'}`} />
              {task}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100 font-sans p-6 flex flex-col items-center relative">
      <div className="w-full max-w-4xl p-8 bg-white rounded-3xl shadow-xl border border-gray-100 transition-all duration-300">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-purple-800 mb-8">My Routine</h1>

        {/* Circular Progress Chart */}
        <div className="flex flex-col items-center mb-12">
            <h2 className="text-2xl font-bold text-purple-600 mb-4">Daily Progress</h2>
            <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        className="text-gray-200"
                        strokeWidth="10"
                        stroke="currentColor"
                        fill="transparent"
                        r="70"
                        cx="80"
                        cy="80"
                    />
                    <circle
                        className="text-pink-500"
                        strokeWidth="10"
                        strokeDasharray={2 * Math.PI * 70}
                        strokeDashoffset={2 * Math.PI * 70 - (2 * Math.PI * 70) * (totalProgress / 100)}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="70"
                        cx="80"
                        cy="80"
                        style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
                    />
                </svg>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl font-bold text-pink-600">
                    {totalProgress}%
                </div>
            </div>
        </div>

        {/* Morning Section */}
        <h2 className="text-2xl font-bold text-purple-600 mb-4 flex items-center">
          <SunIcon className="h-6 w-6 mr-2 text-yellow-500" /> Morning
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {morningRoutines.length > 0 ? (
            morningRoutines.map(renderRoutineCard)
          ) : (
            <p className="text-gray-500">No routines for the morning.</p>
          )}
        </div>

        {/* Afternoon Section */}
        <h2 className="text-2xl font-bold text-purple-600 mb-4 flex items-center">
          <CloudIcon className="h-6 w-6 mr-2 text-blue-400" /> Afternoon
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {afternoonRoutines.length > 0 ? (
            afternoonRoutines.map(renderRoutineCard)
          ) : (
            <p className="text-gray-500">No routines for the afternoon.</p>
          )}
        </div>

        {/* Evening Section */}
        <h2 className="text-2xl font-bold text-purple-600 mb-4 flex items-center">
          <MoonIcon className="h-6 w-6 mr-2 text-indigo-500" /> Evening
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {eveningRoutines.length > 0 ? (
            eveningRoutines.map(renderRoutineCard)
          ) : (
            <p className="text-gray-500">No routines for the evening.</p>
          )}
        </div>
        
        {/* Health & Wellness Section */}
        <h2 className="text-2xl font-bold text-purple-600 mb-4 flex items-center">
          <HeartIcon className="h-6 w-6 mr-2 text-red-500" /> Health & Wellness
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {wellnessRoutines.length > 0 ? (
            wellnessRoutines.map(renderRoutineCard)
          ) : (
            <p className="text-gray-500">No routines for health and wellness.</p>
          )}
        </div>

      </div>

      {/* Add new routine button */}
      <button
        onClick={() => {
          setShowAddForm(true);
          setEditingRoutineId(null);
          setNewRoutineName('');
          setNewRoutineTasks('');
          setNewRoutineTime('Morning');
        }}
        className="fixed bottom-8 right-8 p-4 rounded-full shadow-lg bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white transform hover:scale-110 transition-transform duration-200"
      >
        <PlusCircleIcon className="h-8 w-8" />
      </button>

      {/* Modal for adding/editing new routine */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md animate-fade-in-up">
            <h2 className="text-2xl font-bold text-purple-700 mb-4 text-center">
              {editingRoutineId ? 'Edit Routine' : 'Add New Routine'}
            </h2>
            <form onSubmit={handleAddTask}>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2" htmlFor="routine-name">
                  Routine Name
                </label>
                <input
                  id="routine-name"
                  type="text"
                  value={newRoutineName}
                  onChange={(e) => setNewRoutineName(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="e.g., Morning Yoga"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2" htmlFor="routine-tasks">
                  Tasks (comma-separated)
                </label>
                <input
                  id="routine-tasks"
                  type="text"
                  value={newRoutineTasks}
                  onChange={(e) => setNewRoutineTasks(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="e.g., 5 min meditation, Drink water"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2" htmlFor="routine-time">
                  Time
                </label>
                <select
                  id="routine-time"
                  value={newRoutineTime}
                  onChange={(e) => setNewRoutineTime(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Evening">Evening</option>
                  <option value="Wellness">Health & Wellness</option>
                </select>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-2 rounded-full text-gray-600 font-semibold transition-colors hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white font-semibold transform hover:scale-105 transition-transform"
                >
                  {editingRoutineId ? 'Save Changes' : 'Add Routine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;