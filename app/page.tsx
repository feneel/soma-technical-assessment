"use client";
import { Todo } from "@prisma/client";
import { useState, useEffect } from "react";
import DependencyGraph from "./DependencyGraph";

export default function Home() {
  const [newTodo, setNewTodo] = useState("");
  const [todos, setTodos] = useState([]);
  const [dueDate, setDueDate] = useState("");
  const [dependencies, setDependencies] = useState([]);

  useEffect(() => {
    fetchTodos();
    fetchDependencies();
  }, []);

  const fetchDependencies = async () => {
    try {
      const res = await fetch("/api/dependencies");
      const data = await res.json();
      setDependencies(data);
    } catch (error) {
      console.error("Failed to fetch dependencies:", error);
    }
  };

  const fetchTodos = async () => {
    try {
      const res = await fetch("/api/todos");
      const data = await res.json();
      setTodos(data);
    } catch (error) {
      console.error("Failed to fetch todos:", error);
    }
  };

  const handleAddTodo = async () => {
    if (!newTodo.trim()) return;
    try {
      await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTodo, dueDate }),
      });
      setNewTodo("");
      setDueDate("");
      fetchTodos();
    } catch (error) {
      console.error("Failed to add todo:", error);
    }
  };

  const handleDeleteTodo = async (id: any) => {
    try {
      await fetch(`/api/todos/${id}`, {
        method: "DELETE",
      });
      fetchTodos();
    } catch (error) {
      console.error("Failed to delete todo:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-500 to-red-500 flex flex-col items-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold text-center text-white mb-8">
          Things To Do App
        </h1>
        <div className="flex mb-6">
          <input
            type="text"
            className="flex-grow p-3 rounded-l-full focus:outline-none text-gray-700"
            placeholder="Add a new todo"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
          />
          <input
            type="date"
            className="ml-2 p-2 rounded text-gray-700"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          <button
            onClick={handleAddTodo}
            className="bg-white text-indigo-600 p-3 rounded-r-full hover:bg-gray-100 transition duration-300"
          >
            Add
          </button>
        </div>
        <ul>
          {todos.map((todo: Todo) => (
            <li
              key={todo.id}
              className="flex justify-between items-center bg-white bg-opacity-90 p-4 mb-4 rounded-lg shadow-lg"
            >
              <span className="text-gray-800">{todo.title}</span>
              <span
                className={`text-sm ${
                  new Date(todo.dueDate ? todo.dueDate : "") < new Date()
                    ? "text-red-500"
                    : "text-gray-600"
                }`}
              >
                Due:{" "}
                {new Date(
                  todo.dueDate ? todo.dueDate : ""
                ).toLocaleDateString()}
              </span>

              {todo.imageUrl ? (
                <img
                  src={todo.imageUrl}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded mt-2"
                />
              ) : (
                <span className="text-sm text-gray-400 mt-2">
                  {" "}
                  Loading image...
                </span>
              )}
              <button
                onClick={() => handleDeleteTodo(todo.id)}
                className="text-red-500 hover:text-red-700 transition duration-300"
              >
                {/* Delete Icon */}
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </li>
          ))}
        </ul>

        <h2 className="text-2xl text-white mt-10 mb-4">
          Task Dependency Graph
        </h2>
        <DependencyGraph todos={todos} dependencies={dependencies} />

        <button
          onClick={async () => {
            await fetch("/api/scheduler/recalculate", { method: "POST" });
            fetchTodos();
            alert("Recalculated scheduling info!");
          }}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Recalculate Critical Path & Start Dates
        </button>
      </div>
    </div>
  );
}
