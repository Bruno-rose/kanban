import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { faker } from "@faker-js/faker";
import Board from "./index";
import { Task, User, TaskStatus } from "@/components/types";
import { SocketProvider } from "@/contexts/SocketContext";
import { DndContext } from "@dnd-kit/core";

// Mock DND context
jest.mock("@dnd-kit/core", () => ({
  ...jest.requireActual("@dnd-kit/core"),
  DndContext: ({ children, onDragEnd }: any) => {
    // Store onDragEnd handler to call it later
    (global as any).mockDragEnd = onDragEnd;
    return <div>{children}</div>;
  },
  useSensor: () => ({
    activate: jest.fn(),
    deactivate: jest.fn(),
  }),
  useSensors: (...sensors: any[]) => sensors,
}));

jest.mock("@/contexts/SocketContext", () => ({
  useSocket: jest.fn(() => ({
    socket: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
      id: "test-socket-id",
    },
  })),
  SocketProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

const mockTask: Task = {
  id: faker.string.uuid(),
  title: faker.lorem.sentence(),
  description: faker.lorem.paragraph(),
  status: TaskStatus.TODO,
  createdAt: new Date(),
  updatedAt: new Date(),
  assignedUsers: [],
};

const mockUser: User = {
  id: faker.string.uuid(),
  name: faker.person.fullName(),
};

describe("Board", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).mockDragEnd = null;
  });

  describe("render", () => {
    it("renders the name input modal initially", () => {
      render(
        <SocketProvider>
          <Board />
        </SocketProvider>
      );

      expect(screen.getByText("Enter Your Name")).toBeVisible();
    });

    it("renders the kanban board after name submission", async () => {
      render(
        <SocketProvider>
          <Board />
        </SocketProvider>
      );

      const nameInput = screen.getByRole("textbox", { name: /name/i });
      const submitButton = screen.getByRole("button", {
        name: /start using kanban/i,
      });

      await act(async () => {
        fireEvent.change(nameInput, { target: { value: "Test User" } });
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(screen.queryByText("Enter Your Name")).not.toBeInTheDocument();
      });
    });
  });

  describe("socket events", () => {
    it("updates tasks when receiving initialState event", async () => {
      const { useSocket } = require("@/contexts/SocketContext");
      let socketEventHandler: (tasks: Task[], users: User[]) => void =
        jest.fn();

      useSocket.mockImplementation(() => ({
        socket: {
          on: (event: string, handler: any) => {
            if (event === "initialState") {
              socketEventHandler = handler;
            }
          },
          off: jest.fn(),
          emit: jest.fn(),
          id: "test-socket-id",
        },
      }));

      render(
        <SocketProvider>
          <Board />
        </SocketProvider>
      );

      // Submit name
      const nameInput = screen.getByRole("textbox", { name: /name/i });
      const submitButton = screen.getByRole("button", {
        name: /start using kanban/i,
      });

      await act(async () => {
        fireEvent.change(nameInput, { target: { value: "Test User" } });
        fireEvent.click(submitButton);
      });

      // Simulate receiving initial state
      await act(async () => {
        socketEventHandler([mockTask], [mockUser]);
        // Wait for state updates to complete
        await Promise.resolve();
      });

      await waitFor(() => {
        expect(screen.getByText(mockTask.title)).toBeVisible();
      });
    });

    it("updates users when receiving userJoined event", async () => {
      const { useSocket } = require("@/contexts/SocketContext");
      let userJoinedHandler: (user: User) => void = jest.fn();

      useSocket.mockImplementation(() => ({
        socket: {
          on: (event: string, handler: any) => {
            if (event === "userJoined") {
              userJoinedHandler = handler;
            }
          },
          off: jest.fn(),
          emit: jest.fn(),
          id: "test-socket-id",
        },
      }));

      render(
        <SocketProvider>
          <Board />
        </SocketProvider>
      );

      // Submit name
      const nameInput = screen.getByRole("textbox", { name: /name/i });
      const submitButton = screen.getByRole("button", {
        name: /start using kanban/i,
      });

      await act(async () => {
        fireEvent.change(nameInput, { target: { value: "Test User" } });
        fireEvent.click(submitButton);
        // Wait for state updates to complete
        await Promise.resolve();
      });

      // Simulate user joining
      await act(async () => {
        userJoinedHandler(mockUser);
        // Wait for state updates to complete
        await Promise.resolve();
      });

      await waitFor(() => {
        expect(screen.getByText(mockUser.name)).toBeVisible();
      });
    });
  });

  describe("actions", () => {
    it("emits updateTask event when task is moved", async () => {
      const { useSocket } = require("@/contexts/SocketContext");
      const mockEmit = jest.fn();
      let initialStateHandler: (tasks: Task[], users: User[]) => void =
        jest.fn();

      useSocket.mockImplementation(() => ({
        socket: {
          on: (event: string, handler: any) => {
            if (event === "initialState") {
              initialStateHandler = handler;
            }
          },
          off: jest.fn(),
          emit: mockEmit,
          id: "test-socket-id",
        },
      }));

      render(
        <SocketProvider>
          <Board />
        </SocketProvider>
      );

      // Submit name
      const nameInput = screen.getByRole("textbox", { name: /name/i });
      const submitButton = screen.getByRole("button", {
        name: /start using kanban/i,
      });

      await act(async () => {
        fireEvent.change(nameInput, { target: { value: "Test User" } });
        fireEvent.click(submitButton);
        // Wait for state updates to complete
        await Promise.resolve();
      });

      // Simulate receiving initial state with our mock task
      await act(async () => {
        initialStateHandler([mockTask], [mockUser]);
        // Wait for state updates to complete
        await Promise.resolve();
      });

      // Wait for the task to be rendered
      await waitFor(() => {
        expect(screen.getByText(mockTask.title)).toBeInTheDocument();
      });

      // Simulate DND kit's drag end event directly
      await act(async () => {
        (global as any).mockDragEnd({
          active: { id: mockTask.id },
          over: { id: TaskStatus.IN_PROGRESS },
        });
        // Wait for state updates to complete
        await Promise.resolve();
      });

      // Verify the updateTask event was emitted with correct data
      expect(mockEmit).toHaveBeenCalledWith("updateTask", {
        ...mockTask,
        status: TaskStatus.IN_PROGRESS,
      });
    });

    it("emits joinBoard event when name is submitted", async () => {
      const { useSocket } = require("@/contexts/SocketContext");
      const mockEmit = jest.fn();

      useSocket.mockImplementation(() => ({
        socket: {
          on: jest.fn(),
          off: jest.fn(),
          emit: mockEmit,
          id: "test-socket-id",
        },
      }));

      render(
        <SocketProvider>
          <Board />
        </SocketProvider>
      );

      const nameInput = screen.getByRole("textbox", { name: /name/i });
      const submitButton = screen.getByRole("button", {
        name: /start using kanban/i,
      });

      await act(async () => {
        fireEvent.change(nameInput, { target: { value: "Test User" } });
        fireEvent.click(submitButton);
        // Wait for state updates to complete
        await Promise.resolve();
      });

      expect(mockEmit).toHaveBeenCalledWith("joinBoard", {
        id: "test-socket-id",
        name: "Test User",
      });
    });
  });
});
