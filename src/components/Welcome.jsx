import '../styles/Welcome.css';
import { useNavigate } from 'react-router-dom';

function Welcome({ user }) {
  const navigate = useNavigate();

  const handleGoToTodoList = () => {
    navigate('/todo-list');
  };

  return (
    <div className="bg-[#10082b] p-8 rounded shadow-md w-full max-w-md text-white border border-white">
      <h1 className="text-2xl font-bold mb-6 text-center">Welcome to ToDoNest,</h1>
      <h3 className="text-2xl font-bold mb-6 text-center gradient-text">{user?.full_name}</h3>
      <button
        onClick={handleGoToTodoList}
        className="bg-blue-500 text-white p-2 rounded w-full mt-4"
      >
        Go to Todo List
      </button>
    </div>
  );
}

export default Welcome;