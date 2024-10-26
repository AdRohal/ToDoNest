import React, { useState, useEffect } from 'react';
import axios from 'axios';

function TodoList() {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);
  const [addingTaskCategory, setAddingTaskCategory] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editedCategoryName, setEditedCategoryName] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [editedTaskTitle, setEditedTaskTitle] = useState('');
  const [editedTaskDescription, setEditedTaskDescription] = useState(''); 

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

  const handleDeleteCategory = async (categoryId) => {
    try {
      await axios.delete(`http://localhost:5000/api/category/${categoryId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setCategories(categories.filter((category) => category.id !== categoryId));
    } catch (err) {
      console.error('Error deleting category:', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`http://localhost:5000/api/task/${taskId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setCategories((prevCategories) =>
        prevCategories.map((category) => ({
          ...category,
          tasks: category.tasks.filter((task) => task.id !== taskId),
        }))
      );
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  // Handle renaming a category
  const handleDoubleClickCategory = (categoryId, categoryName) => {
    setEditingCategory(categoryId);
    setEditedCategoryName(categoryName);
  };

  const handleRenameCategory = async (categoryId) => {
    if (!editedCategoryName.trim()) return; // Do nothing if input is empty

    console.log(`Renaming category ${categoryId} to ${editedCategoryName}`); // Add logging

    try {
      const response = await axios.put(
        `http://localhost:5000/api/category/${categoryId}`,
        { name: editedCategoryName },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      console.log('Rename response:', response.data); // Add logging
      setCategories(
        categories.map((category) =>
          category.id === categoryId
            ? { ...category, name: editedCategoryName }
            : category
        )
      );
      setEditingCategory(null); // Exit editing mode
    } catch (err) {
      console.error('Error renaming category:', err);
    }
  };

  const handleKeyDown = (event, categoryId) => {
    if (event.key === 'Enter') {
      handleRenameCategory(categoryId);
    } else if (event.key === 'Escape') {
      setEditingCategory(null); // Exit editing mode without saving
    }
  };

  const handleEditTask = (task, categoryId) => {
    setEditingTask({ id: task.id, categoryId, completed: task.completed });
    setEditedTaskTitle(task.title);
    setEditedTaskDescription(task.description);
  };
  
  const handleUpdateTask = async (taskId) => {
    if (editedTaskTitle === '' && editedTaskDescription === '' && editingTask.completed === undefined) return;

    try {
      const response = await fetch(`http://localhost:5000/api/task/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Use the token from localStorage
        },
        body: JSON.stringify({
          title: editedTaskTitle || undefined,
          description: editedTaskDescription || undefined,
          completed: editingTask.completed,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const updatedTaskFromServer = await response.json();
      // Update the state with the updated task
      setCategories((prevCategories) =>
        prevCategories.map((category) =>
          category.id === editingTask.categoryId
            ? {
                ...category,
                tasks: category.tasks.map((task) =>
                  task.id === taskId ? updatedTaskFromServer : task
                ),
              }
            : category
        )
      );
      setEditingTask(null);
      setEditedTaskTitle('');
      setEditedTaskDescription('');
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  return (
    <div className="container mx-auto p-4 mt-28">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {categories.map((category) => (
          <div key={category.id} className="bg-white p-4 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-2">
              {editingCategory === category.id ? (
                // Edit mode: show input for renaming
                <div className="relative w-full">
                  <input
                    type="text"
                    value={editedCategoryName}
                    onChange={(e) => setEditedCategoryName(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, category.id)} // Handle Enter or Escape
                    className="border p-2 rounded w-full pr-10"
                    autoFocus
                  />
                  <button
                    onClick={() => handleRenameCategory(category.id)}
                    className="absolute right-0 top-0 mt-1 mr-1 bg-blue-500 text-white p-1 rounded"
                  >
                    Save
                  </button>
                </div>
              ) : (
                // Normal mode: show category title, double-click to edit
                <h3
                  className="text-xl font-bold cursor-pointer"
                  onDoubleClick={() =>
                    handleDoubleClickCategory(category.id, category.name)
                  }
                >
                  {category.name}
                </h3>
              )}
              <button
                onClick={() => handleDeleteCategory(category.id)}
                className="text-red-500 hover:text-red-700 transition text-2xl"
              >
                &times;
              </button>
            </div>
            <ul className="mb-4 max-h-48 overflow-y-auto">
              {category.tasks.map((task) => (
                <li key={task.id} className="text-gray-800 flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleTask(category.id, task.id)}
                      className="mr-2"
                    />
                    {editingTask && editingTask.id === task.id ? (
                      <div className="flex flex-col w-full">
                        <input
                          type="text"
                          value={editedTaskTitle}
                          onChange={(e) => setEditedTaskTitle(e.target.value)}
                          className="border p-2 rounded w-full mb-2"
                        />
                        <textarea
                          value={editedTaskDescription}
                          onChange={(e) => setEditedTaskDescription(e.target.value)}
                          className="border p-2 rounded w-full mb-2"
                        />
                        <button
                          onClick={() => handleUpdateTask(task.id)}
                          className="bg-blue-500 text-white p-2 rounded w-full hover:bg-blue-600 transition"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div onDoubleClick={() => handleEditTask(task, category.id)}>
                        <div>{task.title}</div>
                        <div className="text-sm text-gray-600">{task.description}</div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={() => handleEditTask(task, category.id)}
                      className="text-blue-500 hover:text-blue-700 transition mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-red-500 hover:text-red-700 transition"
                    >
                      Delete
                    </button>
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