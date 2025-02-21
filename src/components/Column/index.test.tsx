import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { DndContext } from "@dnd-kit/core";
import { faker } from "@faker-js/faker";
import Column from "./index";
import { Task, TaskStatus, User } from "@/components/types";

const mockTask: Task = {
  id: faker.string.uuid(),
  title: faker.lorem.sentence(),
  description: faker.lorem.paragraph(),
  status: TaskStatus.TODO,
  createdAt: new Date(faker.date.recent()),
  updatedAt: new Date(faker.date.recent()),
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
  onTaskEdit: jest.fn(),
  onTaskDelete: jest.fn(),
  onTaskAdd: jest.fn(),
};

describe("render", () => {
  it("renders column title", () => {
    render(
      <DndContext onDragEnd={() => {}}>
        <Column {...mockProps} />
      </DndContext>
    );
    expect(screen.getByText(TaskStatus.TODO)).toBeVisible();
  });

  it("renders task cards", () => {
    render(
      <DndContext onDragEnd={() => {}}>
        <Column {...mockProps} />
      </DndContext>
    );
    expect(screen.getByText(mockTask.title)).toBeVisible();
  });

  it("renders add task button", () => {
    render(
      <DndContext onDragEnd={() => {}}>
        <Column {...mockProps} />
      </DndContext>
    );
    expect(screen.getByText("Add Task")).toBeVisible();
  });
});

describe("actions", () => {
  it("shows task form when add task is clicked", () => {
    render(
      <DndContext onDragEnd={() => {}}>
        <Column {...mockProps} />
      </DndContext>
    );

    fireEvent.click(screen.getByText("Add Task"));
    expect(screen.getByTestId("task-form")).toBeVisible();
  });

  it("hides task form when cancel is clicked", () => {
    render(
      <DndContext onDragEnd={() => {}}>
        <Column {...mockProps} />
      </DndContext>
    );

    fireEvent.click(screen.getByText("Add Task"));
    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.queryByTestId("task-form")).not.toBeInTheDocument();
  });

  it("calls onTaskAdd with correct data when form is submitted", () => {
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

    expect(mockProps.onTaskAdd).toHaveBeenCalledWith({
      title: "New Task",
      description: "",
      status: TaskStatus.TODO,
    });
  });
});
