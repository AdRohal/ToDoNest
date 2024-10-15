import '../styles/Welcome.css';

function Welcome({ user }) {
  return (
    <div className="bg-[#10082b] p-8 rounded shadow-md w-full max-w-md text-white border border-white">
      <h1 className="text-2xl font-bold mb-6 text-center">Welcome to ToDoNest,</h1>
      <h3 className="text-2xl font-bold mb-6 text-center gradient-text">{user?.full_name}</h3>
    </div>
  );
}

export default Welcome;