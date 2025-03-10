import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { faker } from "@faker-js/faker";
import KanbanBoard from "./index";
import { Task, User, TaskStatus } from "@/components/types";

const mockTask: Task = {
  id: faker.string.uuid(),
  title: faker.lorem.sentence(),
  description: faker.lorem.paragraph(),
  status: TaskStatus.TODO,
  createdAt: new Date(faker.date.recent()),
  updatedAt: new Date(faker.date.recent()),
  assignedUsers: ["1"],
};

const mockUsers: User[] = [
  { id: "1", name: faker.person.fullName() },
  { id: "2", name: faker.person.fullName() },
];

const mockProps = {
  tasks: [mockTask],
  users: mockUsers,
  currentUser: mockUsers[0],
  onTaskMove: jest.fn(),
  onTaskEdit: jest.fn(),
  onTaskDelete: jest.fn(),
  onTaskAdd: jest.fn(),
};

// Mock DndContext's onDragEnd handler
const mockOnDragEnd = jest.fn();

jest.mock("@dnd-kit/core", () => ({
  ...jest.requireActual("@dnd-kit/core"),
  DndContext: ({ children, onDragEnd }: any) => {
    mockOnDragEnd.mockImplementation(onDragEnd);
    return <div>{children}</div>;
  },
  useSensor: () => ({
    activate: jest.fn(),
    deactivate: jest.fn(),
  }),
  useSensors: (...sensors: any[]) => sensors,
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("render", () => {
  it("renders the kanban board", () => {
    render(<KanbanBoard {...mockProps} />);

    expect(screen.getByTestId("kanban-board")).toBeVisible();
  });

  it("renders all status columns", () => {
    const mapStatusToTitle: Record<TaskStatus, string> = {
      [TaskStatus.TODO]: "To Do",
      [TaskStatus.IN_PROGRESS]: "In Progress",
      [TaskStatus.DONE]: "Done",
    };

    render(<KanbanBoard {...mockProps} />);

    Object.values(TaskStatus).forEach((status) => {
      expect(screen.getByText(mapStatusToTitle[status])).toBeVisible();
    });
  });

  it("renders user list", () => {
    render(<KanbanBoard {...mockProps} />);
    mockUsers.forEach((user) => {
      expect(screen.getByText(user.name)).toBeVisible();
    });
  });

  it("renders tasks in correct columns", () => {
    render(<KanbanBoard {...mockProps} />);
    expect(screen.getByText(mockTask.title)).toBeVisible();
  });
});

describe("actions", () => {
  it("calls onTaskMove when task is dragged to a new column", async () => {
    render(<KanbanBoard {...mockProps} />);

    // Simulate drag end event through mocked DndContext
    mockOnDragEnd({
      active: { id: mockTask.id },
      over: { id: TaskStatus.IN_PROGRESS },
    });

    await waitFor(() => {
      expect(mockProps.onTaskMove).toHaveBeenCalledWith(
        mockTask.id,
        TaskStatus.IN_PROGRESS
      );
    });
  });

  it("calls onTaskAdd when new task is created", async () => {
    render(<KanbanBoard {...mockProps} />);

    // Find and click the "Add Task" button
    const addButton = screen.getAllByText("Add Task")[0];
    fireEvent.click(addButton);

    // Fill in the task form
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "New Task" },
    });
    fireEvent.submit(screen.getByTestId("task-form"));

    await waitFor(() => {
      expect(mockProps.onTaskAdd).toHaveBeenCalled();
      const calledWith = mockProps.onTaskAdd.mock.calls[0][0];
      expect(calledWith.title).toBe("New Task");
      expect(calledWith.status).toBe(TaskStatus.TODO);
      expect(calledWith.assignedUsers).toContain(mockProps.currentUser.id);
    });
  });
});
