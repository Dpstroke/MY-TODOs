import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import axios from "axios";
import { FaEdit } from "react-icons/fa";
import { AiFillDelete } from "react-icons/ai";

function App() {
  const [todoName, setTodoName] = useState(""); // Initialize as empty string
  const [description, setDescription] = useState(""); // Initialize as empty string
  const [todos, setTodos] = useState([]);
  const [showFinished, setShowFinished] = useState(true);
  const [isEditing, setIsEditing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = "http://localhost:5000/api/tasks"; // Backend API URL

  // Fetch tasks from backend
  useEffect(() => {
    axios
      .get(API_URL)
      .then((response) => {
        const sanitizedTodos = response.data.map((task) => ({
          ...task,
          name: task.name || "", // Default to empty string
          description: task.description || "", // Default to empty string
        }));
        setTodos(sanitizedTodos);
      })
      .catch((error) => {
        console.error("Error fetching tasks:", error);
        setError("Failed to load tasks.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleAddOrUpdate = () => {
    setError(null);
    if (!todoName.trim()) return; // Prevent empty names

    const request = isEditing
      ? axios.put(`${API_URL}/${isEditing}`, { name: todoName, description })
      : axios.post(API_URL, { name: todoName, description });

    request
      .then((response) => {
        if (isEditing) {
          setTodos(
            todos.map((task) => (task._id === isEditing ? response.data : task))
          );
          setIsEditing(null);
        } else {
          setTodos([...todos, response.data]);
        }
        setTodoName(""); // Reset inputs
        setDescription(""); // Reset inputs
      })
      .catch((error) => {
        console.error("Error saving task:", error);
        setError("Error saving task.");
      });
  };

  const handleDelete = (id) => {
    setError(null);
    axios
      .delete(`${API_URL}/${id}`)
      .then(() => setTodos(todos.filter((item) => item._id !== id)))
      .catch((error) => {
        console.error("Error deleting task:", error);
        setError("Error deleting task.");
      });
  };

  const handleEdit = (id) => {
    const taskToEdit = todos.find((task) => task._id === id);
    if (!taskToEdit) return;

    setTodoName(taskToEdit.name || ""); // Default to empty string
    setDescription(taskToEdit.description || ""); // Default to empty string
    setIsEditing(id);
  };

  const handleToggleCompletion = (id, isCompleted) => {
    const updatedTodos = todos.map((task) =>
      task._id === id ? { ...task, isCompleted: !isCompleted } : task
    );
    setTodos(updatedTodos);

    axios
      .patch(`${API_URL}/${id}`, { isCompleted: !isCompleted })
      .then((response) => {
        setTodos((prev) =>
          prev.map((task) => (task._id === id ? response.data : task))
        );
      })
      .catch((error) => {
        console.error("Error toggling completion:", error);
        setError("Error toggling task completion.");
        setTodos(todos); // Revert optimistic update
      });
  };

  const toggleFinished = () => {
    setShowFinished(!showFinished);
  };

  return (
    <>
      <Navbar />
      <div className="mx-3 md:container md:mx-auto my-5 rounded-xl p-5 bg-violet-100 min-h-[80vh] md:w-1/2">
        <h1 className="font-bold text-center text-xl">Your TODO</h1>
        <div className="addTodo my-5 flex flex-col gap-4">
          <h2 className="text-lg font-bold">{isEditing ? "Edit Todo" : "Add a Todo"}</h2>
          <input
            value={todoName}
            onChange={(e) => setTodoName(e.target.value)}
            placeholder="Task Name"
            type="text"
            className="w-full rounded-full px-5 py-1"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Task Description (optional)"
            className="w-full rounded-xl px-5 py-2"
          />

          <button
            onClick={handleAddOrUpdate}
            disabled={todoName.trim().length <= 3}
            className="bg-violet-800 hover:bg-violet-950 disabled:bg-violet-500 p-2 py-1 text-sm font-bold text-white rounded-md"
          >
            {isEditing ? "Update" : "Save"}
          </button>
        </div>
        <input
          className="my-4"
          onChange={toggleFinished}
          type="checkbox"
          checked={showFinished}
        />{" "}
        Show Finished

        <h2 className="text-lg font-bold">Your Todos</h2>
        {error && <div className="error-message text-red-500">{error}</div>}
        {isLoading ? (
          <div className="m-5">Loading...</div>
        ) : (
          <div className="todos">
            {todos.length === 0 && <div className="m-5">No Todos to display</div>}
            {todos.map(
              (item) =>
                (showFinished || !item.isCompleted) && (
                  <div
                    key={item._id}
                    className="todo flex md:w-1/2 my-3 justify-between"
                  >
                    <div className="flex gap-5">
                      <input
                        name={item._id}
                        type="checkbox"
                        checked={!!item.isCompleted} // Ensure boolean value
                        onChange={() =>
                          handleToggleCompletion(item._id, item.isCompleted)
                        }
                      />
                      <div className={item.isCompleted ? "line-through" : ""}>
                        {item.name || "Unnamed Task"}: {item.description || ""}
                      </div>
                    </div>
                    <div className="buttons flex h-full">
                      <button
                        onClick={() => handleEdit(item._id)}
                        className="bg-violet-800 hover:bg-violet-950 p-2 py-1 text-sm font-bold text-white rounded-md mx-1"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="bg-violet-800 hover:bg-violet-950 p-2 py-1 text-sm font-bold text-white rounded-md mx-1"
                      >
                        <AiFillDelete />
                      </button>
                    </div>
                  </div>
                )
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default App;
