import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DndContext } from "@dnd-kit/core";
import { faker } from "@faker-js/faker";
import Column from "./index";
import { Task, TaskStatus, User } from "@/components/types";

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

const mockProps = {
  status: TaskStatus.TODO,
  tasks: [mockTask],
  users: [mockUser],
  onTaskEdit: jest.fn().mockImplementation(() => Promise.resolve()),
  onTaskDelete: jest.fn().mockImplementation(() => Promise.resolve()),
  onTaskAdd: jest.fn().mockImplementation(() => Promise.resolve()),
};

beforeEach(() => {
  jest.clearAllMocks();
});

it("renders column title", () => {
  render(
    <DndContext onDragEnd={() => {}}>
      <Column {...mockProps} />
    </DndContext>
  );

  expect(screen.getByText("To Do")).toBeVisible();
});

it("renders task cards", async () => {
  render(
    <DndContext onDragEnd={() => {}}>
      <Column {...mockProps} />
    </DndContext>
  );

  await waitFor(() => {
    expect(screen.getByText(mockTask.title)).toBeVisible();
  });
});

it("handles adding a new task", async () => {
  render(
    <DndContext onDragEnd={() => {}}>
      <Column {...mockProps} />
    </DndContext>
  );

  // Click add task button
  const addButton = screen.getByText("Add Task");
  fireEvent.click(addButton);

  // Wait for form to appear
  const form = await screen.findByTestId("task-form");
  expect(form).toBeVisible();

  // Fill form
  const titleInput = screen.getByLabelText(/title/i);
  const descriptionInput = screen.getByLabelText(/description/i);

  fireEvent.change(titleInput, { target: { value: "New Task" } });
  fireEvent.change(descriptionInput, {
    target: { value: "New Description" },
  });

  // Submit form
  fireEvent.submit(form);

  // Verify submission
  await waitFor(() => {
    expect(mockProps.onTaskAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "New Task",
        description: "New Description",
        status: TaskStatus.TODO,
      })
    );
  });
});

describe("actions", () => {
  it("shows task form when add task is clicked", async () => {
    render(
      <DndContext onDragEnd={() => {}}>
        <Column {...mockProps} />
      </DndContext>
    );

    fireEvent.click(screen.getByText("Add Task"));

    await waitFor(() => {
      expect(screen.getByTestId("task-form")).toBeVisible();
    });
  });

  it("hides task form when cancel is clicked", async () => {
    render(
      <DndContext onDragEnd={() => {}}>
        <Column {...mockProps} />
      </DndContext>
    );

    fireEvent.click(screen.getByText("Add Task"));
    fireEvent.click(screen.getByText("Cancel"));

    await waitFor(() => {
      expect(screen.queryByTestId("task-form")).not.toBeInTheDocument();
    });
  });

  it("calls onTaskAdd with correct data when form is submitted", async () => {
    render(
      <DndContext onDragEnd={() => {}}>
        <Column {...mockProps} />
      </DndContext>
    );

    fireEvent.click(screen.getByText("Add Task"));
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "New Task" },
    });
    fireEvent.submit(screen.getByTestId("task-form"));

    await waitFor(() => {
      expect(mockProps.onTaskAdd).toHaveBeenCalledWith({
        title: "New Task",
        description: "",
        status: TaskStatus.TODO,
      });
    });
  });
});
