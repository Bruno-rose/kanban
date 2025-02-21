import { Server } from "socket.io";
import express from "express";
import { createServer } from "http";
import cors from "cors";
import { Task, User, TaskStatus } from "@/components/types";

interface ServerToClientEvents {
  userJoined: (user: User) => void;
  userLeft: (userId: string) => void;
  taskUpdated: (task: Task) => void;
  taskDeleted: (taskId: string) => void;
  taskAdded: (task: Task) => void;
  initialState: (tasks: Task[], users: User[]) => void;
}

interface ClientToServerEvents {
  joinBoard: (user: User) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  addTask: (task: Task) => void;
}

const app = express();
app.use(cors());

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling'],
  allowEIO3: true
});

const state = {
  tasks: [] as Task[],
  users: [] as User[]
};

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("joinBoard", (user) => {
    state.users.push(user);
    socket.emit("initialState", state.tasks, state.users);
    socket.broadcast.emit("userJoined", user);
  });

  socket.on("updateTask", (task) => {
    const index = state.tasks.findIndex(t => t.id === task.id);
    if (index !== -1) {
      state.tasks[index] = task;
    }
    io.emit("taskUpdated", task);
  });

  socket.on("deleteTask", (taskId) => {
    state.tasks = state.tasks.filter(t => t.id !== taskId);
    io.emit("taskDeleted", taskId);
  });

  socket.on("addTask", (task) => {
    state.tasks.push(task);
    io.emit("taskAdded", task);
  });

  socket.on("disconnect", () => {
    const userIndex = state.users.findIndex(u => u.id === socket.id);
    if (userIndex !== -1) {
      const user = state.users[userIndex];
      state.users.splice(userIndex, 1);
      socket.broadcast.emit("userLeft", user.id);
    }
  });
});

// Add a basic health check endpoint
app.get('/health', (req, res) => {
  res.send('Socket server is running');
});

const PORT = process.env.SOCKET_PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running at http://localhost:${PORT}`);
});

// Error handling
httpServer.on('error', (err) => {
  console.error('Server error:', err);
});

io.on('connect_error', (err) => {
  console.error('Socket connection error:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
}); 