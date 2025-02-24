import { Server, Socket } from 'socket.io';
import { createServer } from 'http';
import { io as Client, Socket as ClientSocket } from 'socket.io-client';
import { AddressInfo } from 'net';
import { Task, User, TaskStatus } from '@/components/types';

interface ServerToClientEvents {
  initialState: (tasks: Task[], users: User[]) => void;
  taskAdded: (task: Task) => void;
  taskEditingStarted: (taskId: string, userName: string) => void;
  taskUpdated: (task: Task) => void;
  taskDeleted: (taskId: string) => void;
  deleteTaskError: (taskId: string, message: string) => void;
  taskEditingStopped: (taskId: string) => void;
  taskDragStarted: (taskId: string, userName: string) => void;
  taskDragEnded: (taskId: string) => void;
  userLeft: (userId: string) => void;
}

interface ClientToServerEvents {
  joinBoard: (user: User) => void;
  addTask: (task: Task) => void;
  startEditing: (taskId: string) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  stopEditing: (taskId: string) => void;
  startDragging: (taskId: string) => void;
  stopDragging: (taskId: string) => void;
}

const TEST_USER: User = {
  id: '123',
  name: 'Test User'
};

const TEST_TASK: Task = {
  id: '1',
  title: 'Test Task',
  status: TaskStatus.TODO,
  description: 'Test Description',
  createdAt: new Date(),
  updatedAt: new Date(),
  assignedUsers: [],
};

describe('Socket Server Tests', () => {
  let io: Server<ClientToServerEvents, ServerToClientEvents>;
  let serverSocket: Socket<ClientToServerEvents, ServerToClientEvents>;
  let clientSocket: ClientSocket<ServerToClientEvents, ClientToServerEvents>;
  let httpServer: ReturnType<typeof createServer>;

  const setupSocketHandlers = (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
    socket.on('joinBoard', (user: User) => {
      socket.emit('initialState', [], [user]);
    });

    socket.on('addTask', (task: Task) => {
      socket.emit('taskAdded', task);
    });

    socket.on('startEditing', (taskId: string) => {
      socket.emit('taskEditingStarted', taskId, 'Test User');
    });

    socket.on('updateTask', (task: Task) => {
      socket.emit('taskUpdated', task);
    });

    socket.on('deleteTask', (taskId: string) => {
      // Check if task is being edited
      if (socket.data.editingTaskId === taskId) {
        socket.emit('deleteTaskError', taskId, 'Task is being edited by Test User');
      } else {
        socket.emit('taskDeleted', taskId);
      }
    });

    socket.on('stopEditing', (taskId: string) => {
      socket.emit('taskEditingStopped', taskId);
    });

    socket.on('startDragging', (taskId: string) => {
      socket.emit('taskDragStarted', taskId, 'Test User');
    });

    socket.on('stopDragging', (taskId: string) => {
      socket.emit('taskDragEnded', taskId);
    });

    socket.on('disconnect', () => {
      socket.broadcast.emit('userLeft', socket.id);
    });
  };

  beforeAll((done) => {
    httpServer = createServer();
    io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      },
      transports: ['polling']
    });
    
    httpServer.listen(() => {
      const port = (httpServer.address() as AddressInfo).port;
      clientSocket = Client(`http://localhost:${port}`, {
        transports: ['polling'],
        forceNew: true
      });
      
      io.on('connection', (socket) => {
        serverSocket = socket;
        setupSocketHandlers(socket);
      });

      clientSocket.on('connect', done);
    });
  });

  afterAll((done) => {
    if (clientSocket.connected) {
      clientSocket.disconnect();
    }
    io.close();
    httpServer.close(done);
  });

  beforeEach((done) => {
    if (!clientSocket.connected) {
      clientSocket.connect();
    }
    done();
  });

  describe('Board Management', () => {
    test('should handle joinBoard event', (done) => {
      clientSocket.on('initialState', (tasks: Task[], users: User[]) => {
        expect(users).toContainEqual(TEST_USER);
        done();
      });

      clientSocket.emit('joinBoard', TEST_USER);
    });
  });

  describe('Task Management', () => {
    test('should handle addTask event', (done) => {
      clientSocket.on('taskAdded', (task: Task) => {
        const receivedTask = {
          ...task,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt)
        };
        
        expect(receivedTask).toEqual(TEST_TASK);
        done();
      });

      clientSocket.emit('addTask', TEST_TASK);
    });

    test('should handle task editing', (done) => {
      const taskId = '1';
      const userName = 'Test User';

      clientSocket.on('taskEditingStarted', (receivedTaskId: string, receivedUserName: string) => {
        expect(receivedTaskId).toBe(taskId);
        expect(receivedUserName).toBe(userName);
        done();
      });

      clientSocket.emit('startEditing', taskId);
    });

    test('should handle updateTask event', (done) => {
      const updatedTask: Task = {
        id: '1',
        title: 'Updated Task',
        status: TaskStatus.IN_PROGRESS,
        description: 'Updated Description',
        createdAt: new Date(),
        updatedAt: new Date(),
        assignedUsers: ['user1'],
      };

      clientSocket.on('taskUpdated', (task: Task) => {
        const receivedTask = {
          ...task,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt)
        };
        expect(receivedTask).toEqual(updatedTask);
        done();
      });

      clientSocket.emit('updateTask', updatedTask);
    });

    test('should handle deleteTask event', (done) => {
      const taskId = '1';

      clientSocket.on('taskDeleted', (receivedTaskId: string) => {
        expect(receivedTaskId).toBe(taskId);
        done();
      });

      clientSocket.emit('deleteTask', taskId);
    });

    test('should handle stopEditing event', (done) => {
      const taskId = '1';

      clientSocket.on('taskEditingStopped', (receivedTaskId: string) => {
        expect(receivedTaskId).toBe(taskId);
        done();
      });

      clientSocket.emit('stopEditing', taskId);
    });

    test('should handle startDragging event', (done) => {
      const taskId = '1';
      const userName = 'Test User';

      clientSocket.on('taskDragStarted', (receivedTaskId: string, receivedUserName: string) => {
        expect(receivedTaskId).toBe(taskId);
        expect(receivedUserName).toBe(userName);
        done();
      });

      clientSocket.emit('startDragging', taskId);
    });

    test('should handle stopDragging event', (done) => {
      const taskId = '1';

      clientSocket.on('taskDragEnded', (receivedTaskId: string) => {
        expect(receivedTaskId).toBe(taskId);
        done();
      });

      clientSocket.emit('stopDragging', taskId);
    });
  });

  test('should handle user disconnection', (done) => {
    const testUser: User = {
      id: clientSocket.id || '',
      name: 'Test User'
    };

    // Create a second client to receive the disconnect event
    const secondClient = Client(`http://localhost:${(httpServer.address() as AddressInfo).port}`, {
      transports: ['polling'],
      forceNew: true
    });

    secondClient.on('userLeft', (userId: string) => {
      expect(userId).toBe(testUser.id);
      secondClient.disconnect();
      done();
    });

    // Wait for second client to connect before proceeding
    secondClient.on('connect', () => {
      clientSocket.emit('joinBoard', testUser);
      clientSocket.disconnect();
    });
  }, 15000); // Increased timeout

  test('should handle deleteTask error when task is being edited', (done) => {
    const taskId = '1';

    // Set up the editing state
    clientSocket.emit('startEditing', taskId);
    
    // Wait for editing to be confirmed before attempting delete
    clientSocket.on('taskEditingStarted', () => {
      // Store the editing state on the server
      serverSocket.data = { editingTaskId: taskId };

      // Now try to delete
      clientSocket.on('deleteTaskError', (receivedTaskId: string, errorMessage: string) => {
        expect(receivedTaskId).toBe(taskId);
        expect(errorMessage).toContain('being edited');
        done();
      });

      clientSocket.emit('deleteTask', taskId);
    });
  }, 15000);
});