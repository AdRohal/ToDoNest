import React, { useState, useEffect } from 'react';
import axios from 'axios';
import trashIcon from "../../src/images/trash-48.png";

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
  const [isPopupVisible, setIsPopupVisible] = useState(false); // New state for popup visibility

  useEffect(() => {
    document.title = 'Todo List - ToDoNest';
    
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
    if (!newTaskTitle.trim()) {
      console.log("Task title is empty, cannot save");
      return;
    }

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
      setNewTaskTitle('');
      setNewTaskDescription('');
      setAddingTaskCategory(null);
      setIsPopupVisible(false); // Close the popup after saving
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
    setIsPopupVisible(true);
  };

  const handleAddNewTask = (categoryId) => {
    setAddingTaskCategory(categoryId);
    setIsPopupVisible(true);
  };

  const handleUpdateTask = async (taskId) => {
    if (editedTaskTitle === '' && editedTaskDescription === '' && editingTask.completed === undefined) return;
  
    try {
      console.log('Sending update:', {
        title: editedTaskTitle || undefined,
        description: editedTaskDescription || undefined,
        completed: editingTask.completed,
      }); // Debugging log
  
      const response = await axios.put(
        `http://localhost:5000/api/task/${taskId}`,
        {
          title: editedTaskTitle || undefined,
          description: editedTaskDescription || undefined,
          completed: editingTask.completed,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
  
      if (!response.data) {
        throw new Error('Failed to update task');
      }
  
      const updatedTaskFromServer = response.data;
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
      setIsPopupVisible(false);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };
  
  return (
    <div className="container mx-auto p-4 mt-28">
      <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 ${isPopupVisible ? 'blur-sm' : ''}`}>
        {categories.map((category) => (
          <div key={category.id} className="bg-white p-4 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-2">
              {editingCategory === category.id ? (
                <div className="relative w-full">
                  <input
                    type="text"
                    value={editedCategoryName}
                    onChange={(e) => setEditedCategoryName(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, category.id)}
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
                    <div onDoubleClick={() => handleEditTask(task, category.id)}>
                      <div>{task.title}</div>
                      <div className="text-sm text-gray-600">{task.description}</div>
                    </div>
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
                      <img width="24" height="24" src={trashIcon} alt="Trash" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleAddNewTask(category.id)}
              className="bg-gray-200 text-gray-800 p-2 rounded w-full hover:bg-gray-300 transition"
            >
              Add New Task
            </button>
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

      {/* Popup for editing task */}
      {isPopupVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h2 className="text-xl font-bold mb-4">{editingTask ? 'Edit Task' : 'Add New Task'}</h2>
            <input
              type="text"
              value={editingTask ? editedTaskTitle : newTaskTitle}
              onChange={(e) => editingTask ? setEditedTaskTitle(e.target.value) : setNewTaskTitle(e.target.value)}
              className="border p-2 rounded w-full mb-2"
              placeholder="Task Title"
            />
            <textarea
              value={editingTask ? editedTaskDescription : newTaskDescription}
              onChange={(e) => editingTask ? setEditedTaskDescription(e.target.value) : setNewTaskDescription(e.target.value)}
              className="border p-2 rounded w-full mb-2"
              placeholder="Task Description"
            />
            <div className="flex justify-end">
              <button
                onClick={() => setIsPopupVisible(false)}
                className="bg-gray-200 text-gray-800 p-2 rounded mr-2 hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (editingTask) {
                    handleUpdateTask(editingTask.id);
                  } else {
                    handleCreateTask(addingTaskCategory);
                  }
                }}
                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TodoList;