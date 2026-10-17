import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const initialTasks = [
  { id: 1, title: "Revise machine learning notes", category: "Study", done: true },
  { id: 2, title: "Complete project development", category: "Project", done: false },
  { id: 3, title: "Practice Python problems", category: "Learning", done: false },
];

function App() {
  const [tasks, setTasks] = useState(() => {
    try {
      const savedTasks = localStorage.getItem("nudgenest-tasks");
      return savedTasks ? JSON.parse(savedTasks) : initialTasks;
    } catch {
      return initialTasks;
    }
  });
  const [newTask, setNewTask] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hi! 👋 I'm NudgeNest AI. I can help you organize your day, manage tasks, and plan your study sessions.",
    },
  ]);
  const [activeTab, setActiveTab] = useState("Overview");

  useEffect(() => {
    localStorage.setItem("nudgenest-tasks", JSON.stringify(tasks));
  }, [tasks]);

  const completed = tasks.filter((task) => task.done).length;

  function addTask(event) {
    event.preventDefault();
    if (!newTask.trim()) return;

    setTasks((current) => [
      ...current,
      {
        id: Date.now(),
        title: newTask.trim(),
        category: "Personal",
        done: false,
      },
    ]);
    setNewTask("");
  }

  function toggleTask(id) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
  }

  async function sendMessage(event) {
    event.preventDefault();
    
    const question = message.trim();
    if (!question) return;

    setMessage("");
    setMessages((current) => [
      ...current,
      { role: "user", text: question },
    ]);

    try {
      const taskSummary = tasks.length
        ? tasks
            .map(
              (task) => 
                `-${task.title}: ${task.done ? "Completed" : "Pending"}`
            )
            .join("\n")
        : "No tasks added yet.";
      
      const response = await axios.post(
        "http://localhost:8000/chat", 
        {
          message: `My current tasks are:\n${taskSummary}\n\nMy request: ${question}\n\nPlease give me a practical answer based on my tasks. Prioritize pending tasks and suggest a realistic schedule.`,
        }
      );    

      setMessages((current) => [
        ...current,
        { role: "ai", text: response.data.reply },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        { 
          role: "ai", 
          text: "Connection error. Please check that the NudgeNest backend is running on port 8000." 
        },
      ]);
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">✳</div>
          <div>
            <h2>NudgeNest</h2>
            <span>YOUR PERSONAL AI</span>
          </div>
        </div>

        <div className="nav-label">WORKSPACE</div>
        {["Overview", "AI Assistant", "My Planner", "Tasks", "Shopping List"].map(
          (item, index) => (
            <button
              key={item}
              className={`nav-item ${activeTab === item ? "active" : ""}`}
              onClick={() => setActiveTab(item)}
            >
              <span>{["◫", "✧", "▦", "✓", "🛍"][index]}</span>
              {item}
              {item === "Tasks" && <small>{tasks.length}</small>}
            </button>
          )
        )}

        <div className="sidebar-bottom">
          <div className="local-badge">
            <span className="status-dot" />
            <div>
              <strong>Local AI</strong>
              <span>Private & on your device</span>
            </div>
          </div>
          <div className="profile">
            <div className="avatar">N</div>
            <div>
              <strong>My Workspace</strong>
              <span>Personal account</span>
            </div>
            <span className="profile-dots">···</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">Workspace <span>/</span> {activeTab}</div>
          <div className="topbar-right">
            <span className="today-label">✧ Your day, simplified</span>
            <div className="avatar small-avatar">N</div>
          </div>
        </header>

        <section className="welcome">
          <div>
            <div className="eyebrow">FRIDAY, YOUR WAY ✨</div>
            <h1>Make space for what matters.</h1>
            <p>Your personal space to plan smarter, focus better, and get things done.</p>
          </div>
          <div className="welcome-art">
            <div className="art-orbit orbit-one" />
            <div className="art-orbit orbit-two" />
            <div className="art-star">✳</div>
          </div>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-top"><span>Tasks completed</span><span className="stat-icon purple">✓</span></div>
            <h2>{completed}<span> / {tasks.length}</span></h2>
            <div className="progress-track"><div style={{ width: `${tasks.length ? (completed / tasks.length) * 100 : 0}%` }} /></div>
            <p>Keep up the momentum</p>
          </div>
          <div className="stat-card">
            <div className="stat-top"><span>Today's focus</span><span className="stat-icon yellow">◷</span></div>
            <h2>2.5 <span>hrs</span></h2>
            <p className="stat-note">A little progress adds up.</p>
          </div>
          <div className="stat-card">
            <div className="stat-top"><span>Daily streak</span><span className="stat-icon pink">✧</span></div>
            <h2>3 <span>days</span></h2>
            <p className="stat-note">You're building a habit!</p>
          </div>
        </section>

        <section className="content-grid">
          <div className="panel tasks-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">STAY ON TRACK</span>
                <h2>Today's tasks</h2>
              </div>
              <span className="task-count">{completed}/{tasks.length} done</span>
            </div>

            <form className="add-task" onSubmit={addTask}>
              <input
                value={newTask}
                onChange={(event) => setNewTask(event.target.value)}
                placeholder="Add a task for today..."
                aria-label="New task"
              />
              <button type="submit">+ Add</button>
            </form>

            <div className="task-list">
              {tasks.map((task) => (
                <label className={`task-row ${task.done ? "task-done" : ""}`} key={task.id}>
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => toggleTask(task.id)}
                  />
                  <span className="custom-check">{task.done ? "✓" : ""}</span>
                  <span className="task-title">{task.title}<small>{task.category}</small></span>
                  <span className="task-arrow">›</span>
                </label>
              ))}
              {tasks.length === 0 && <p className="empty-state">Your task list is clear. Add something to get started!</p>}
            </div>
          </div>

          <div className="panel assistant-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">HERE FOR YOU</span>
                <h2><span className="assistant-spark">✳</span> AI Assistant</h2>
              </div>
              <span className="online-pill"><span className="status-dot" /> Ready</span>
            </div>

            <div className="chat-messages">
              {messages.map((item, index) => (
                <div className={`chat-message ${item.role}`} key={index}>
                  {item.role === "ai" && <span className="chat-avatar">✳</span>}
                  <p>{item.text}</p>
                </div>
              ))}
            </div>

            <div className="suggestions">
              <button onClick={() => setMessage("Help me plan my day")}>Plan my day</button>
              <button onClick={() => setMessage("Help me focus on studying")}>Study focus</button>
            </div>

            <form className="chat-input" onSubmit={sendMessage}>
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Ask me anything..."
                aria-label="Message AI assistant"
              />
              <button type="submit" aria-label="Send message">↑</button>
            </form>
            <p className="privacy-note">✦ Your personal space, designed for you</p>
          </div>
        </section>

        <footer className="app-footer">
          <span>✳ NudgeNest AI</span>
          <span>Small nudges. Meaningful progress.</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
