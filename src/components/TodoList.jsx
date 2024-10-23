import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function TodoList() {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);
  const [addingTaskCategory, setAddingTaskCategory] = useState(null); // Track which category is adding a new task
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/categories', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setCategories(response.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, []);

  const handleCreateCategory = async () => {
    if (!newCategoryName) return;

    try {
      const response = await axios.post(
        'http://localhost:5000/api/category',
        { name: newCategoryName },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setCategories([...categories, { ...response.data, tasks: [] }]);
      setNewCategoryName('');
      setAddingCategory(false); // Close the form after adding
    } catch (err) {
      console.error('Error creating category:', err);
    }
  };

  const handleCreateTask = async (categoryId) => {
    if (!newTaskTitle) return;

    try {
      const response = await axios.post(
        'http://localhost:5000/api/task',
        { categoryId, title: newTaskTitle, description: newTaskDescription },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setCategories(
        categories.map((category) =>
          category.id === categoryId
            ? { ...category, tasks: [...category.tasks, response.data] }
            : category
        )
      );
      setNewTaskTitle(''); // Clear the input field after adding
      setNewTaskDescription(''); // Clear the input field after adding
      setAddingTaskCategory(categoryId); // Keep the input open for the same category
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  const handleToggleTask = async (categoryId, taskId) => {
    try {
      const category = categories.find(category => category.id === categoryId);
      const task = category.tasks.find(task => task.id === taskId);
      const updatedTask = { ...task, completed: !task.completed };

      await axios.put(
        `http://localhost:5000/api/task/${taskId}`,
        { completed: updatedTask.completed },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setCategories(
        categories.map((category) =>
          category.id === categoryId
            ? {
                ...category,
                tasks: category.tasks.map((task) =>
                  task.id === taskId ? updatedTask : task
                ),
              }
            : category
        )
      );
    } catch (err) {
      console.error('Error toggling task:', err);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {categories.map((category) => (
          <div key={category.id} className="bg-white p-4 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-2">{category.name}</h3>
            <ul className="mb-4">
              {category.tasks.map((task) => (
                <li key={task.id} className="text-gray-800 flex items-center">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleTask(category.id, task.id)}
                    className="mr-2"
                  />
                  <div>
                    <div>{task.title}</div>
                    <div className="text-sm text-gray-600">{task.description}</div>
                  </div>
                </li>
              ))}
              {addingTaskCategory === category.id && (
                <>
                  <input
                    type="text"
                    placeholder="Task Title"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="border p-2 rounded w-full mb-2"
                  />
                  <textarea
                    placeholder="Task Description"
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    className="border p-2 rounded w-full mb-2"
                  />
                  <button
                    onClick={() => handleCreateTask(category.id)}
                    className="bg-blue-500 text-white p-2 rounded w-full hover:bg-blue-600 transition"
                  >
                    Add Task
                  </button>
                </>
              )}
            </ul>
            {addingTaskCategory === category.id ? (
              <button
                onClick={() => setAddingTaskCategory(null)}
                className="bg-gray-200 text-gray-800 p-2 rounded w-full hover:bg-gray-300 transition"
              >
                Close Task Input
              </button>
            ) : (
              <button
                onClick={() => setAddingTaskCategory(category.id)}
                className="bg-gray-200 text-gray-800 p-2 rounded w-full hover:bg-gray-300 transition"
              >
                Add New Task
              </button>
            )}
          </div>
        ))}

        {/* Add Category Button */}
        {addingCategory ? (
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <input
              type="text"
              placeholder="Category Title"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="border p-2 rounded w-full mb-4"
            />
            <button
              onClick={handleCreateCategory}
              className="bg-blue-500 text-white p-2 rounded w-full hover:bg-blue-600 transition"
            >
              Create Category
            </button>
          </div>
        ) : (
          <div
            onClick={() => setAddingCategory(true)}
            className="bg-gray-200 p-4 rounded-lg shadow-lg flex items-center justify-center cursor-pointer hover:bg-gray-300 transition"
          >
            <span className="text-4xl text-gray-500">+</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default TodoList;