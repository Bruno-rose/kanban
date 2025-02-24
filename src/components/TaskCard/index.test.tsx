import React from "react";
import { DndContext } from "@dnd-kit/core";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { faker } from "@faker-js/faker";
import TaskCard from "./index";
import { Task, TaskStatus, User } from "@/components/types";

const mockTask: Task = {
  id: faker.string.uuid(),
  title: faker.lorem.sentence(),
  description: faker.lorem.paragraph(),
  status: TaskStatus.TODO,
  createdAt: new Date(),
  updatedAt: new Date(),
  assignedUsers: [],
  currentEditor: undefined,
  currentDragger: undefined,
};

const mockCurrentUser: User = {
  id: faker.string.uuid(),
  name: faker.person.fullName(),
};

const mockProps = {
  task: mockTask,
  currentUser: mockCurrentUser,
  onEdit: jest.fn().mockImplementation(() => Promise.resolve()),
  onDelete: jest.fn().mockImplementation(() => Promise.resolve()),
  onDragEnd: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();

  window.confirm = jest.fn(() => true);
});

describe("render", () => {
  it("renders task title", () => {
    render(
      <DndContext onDragEnd={mockProps.onDragEnd}>
        <TaskCard {...mockProps} />
      </DndContext>
    );

    expect(screen.getByText(mockTask.title)).toBeVisible();
  });

  it("renders task description", () => {
    render(
      <DndContext onDragEnd={mockProps.onDragEnd}>
        <TaskCard {...mockProps} />
      </DndContext>
    );

    expect(screen.getByText(mockTask.description)).toBeVisible();
  });

  it("renders edit button", () => {
    render(
      <DndContext onDragEnd={mockProps.onDragEnd}>
        <TaskCard {...mockProps} />
      </DndContext>
    );

    expect(screen.getByText("Edit")).toBeVisible();
  });

  it("renders delete button", () => {
    render(
      <DndContext onDragEnd={mockProps.onDragEnd}>
        <TaskCard {...mockProps} />
      </DndContext>
    );

    expect(screen.getByText("Delete")).toBeVisible();
  });
});

describe("actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.confirm = jest.fn(() => true);
  });

  it("calls onDelete when delete button is clicked", async () => {
    render(
      <DndContext onDragEnd={() => {}}>
        <TaskCard {...mockProps} />
      </DndContext>
    );

    await act(async () => {
      const deleteButton = screen.getByRole("button", { name: /delete/i });
      fireEvent.click(deleteButton);
    });

    expect(mockProps.onDelete).toHaveBeenCalledWith(mockTask.id);
  });

  it("calls onEdit when edit button is clicked and form is submitted", async () => {
    render(
      <DndContext>
        <TaskCard {...mockProps} />
      </DndContext>
    );

    // Click edit button using test-id
    await act(async () => {
      const editButton = screen.getByTestId("edit-button");
      fireEvent.click(editButton);
    });

    // Fill and submit the form
    await act(async () => {
      const form = screen.getByTestId("task-form");
      fireEvent.submit(form);
    });

    expect(mockProps.onEdit).toHaveBeenCalled();
  });

  it("renders editing badge when task is being edited", () => {
    const taskWithEditor = {
      ...mockTask,
      currentEditor: "John Doe",
    };

    render(
      <DndContext onDragEnd={mockProps.onDragEnd}>
        <TaskCard {...mockProps} task={taskWithEditor} />
      </DndContext>
    );

    expect(screen.getByText(/Editing by John Doe/)).toBeVisible();
  });

  it("renders dragging badge when task is being dragged", () => {
    const taskWithDragger = {
      ...mockTask,
      currentDragger: "Jane Doe",
    };

    render(
      <DndContext onDragEnd={mockProps.onDragEnd}>
        <TaskCard {...mockProps} task={taskWithDragger} />
      </DndContext>
    );

    expect(screen.getByText(/Moving by Jane Doe/)).toBeVisible();
  });
});
