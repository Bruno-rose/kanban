import React from "react";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { render, screen, fireEvent } from "@testing-library/react";
import { faker } from "@faker-js/faker";
import TaskCard from "./index";
import { TaskStatus } from "@/components/types";

const mockTask = {
  id: faker.string.uuid(),
  title: faker.lorem.sentence(),
  description: faker.lorem.paragraph(),
  status: "TODO" as TaskStatus,
  userId: faker.string.uuid(),
  createdAt: faker.date.recent().toISOString(),
  updatedAt: faker.date.recent().toISOString(),
  assignedUsers: [],
};

const mockProps = {
  task: mockTask,
  index: 0,
  onEdit: jest.fn(),
  onDelete: jest.fn(),
  onDragEnd: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("render", () => {
  it("renders task title and description", () => {
    render(
      <DndContext onDragEnd={mockProps.onDragEnd}>
        <TaskCard {...mockProps} />
      </DndContext>
    );

    expect(screen.getByText(mockTask.title)).toBeVisible();
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
  it("calls onDelete when delete button is clicked", () => {
    render(
      <DndContext onDragEnd={mockProps.onDragEnd}>
        <TaskCard {...mockProps} />
      </DndContext>
    );

    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);

    expect(mockProps.onDelete).toHaveBeenCalledWith(mockTask.id);
  });

  it("calls onEdit when edit button is clicked", () => {
    render(
      <DndContext onDragEnd={mockProps.onDragEnd}>
        <TaskCard {...mockProps} />
      </DndContext>
    );

    const editButton = screen.getByText("Edit");
    fireEvent.click(editButton);

    expect(mockProps.onEdit).toHaveBeenCalledWith(mockTask);
  });
});
