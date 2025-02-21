import React from "react";
import { faker } from "@faker-js/faker";
import { render, screen, fireEvent } from "@testing-library/react";
import TaskForm from "./index";
import { Task, TaskStatus } from "@/components/types";

const mockTask: Task = {
  id: faker.string.uuid(),
  title: faker.lorem.sentence(),
  description: faker.lorem.paragraph(),
  status: TaskStatus.TODO,
  createdAt: new Date(faker.date.recent()),
  updatedAt: new Date(faker.date.recent()),
  assignedUsers: [],
};

const mockProps = {
  onSubmit: jest.fn(),
  onCancel: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("render", () => {
  it("renders the title", () => {
    render(<TaskForm {...mockProps} />);

    expect(screen.getByLabelText("Title")).toBeVisible();
  });

  it("renders the description", () => {
    render(<TaskForm {...mockProps} />);

    expect(screen.getByLabelText("Description")).toBeVisible();
  });

  it("renders the create task button", () => {
    render(<TaskForm {...mockProps} />);

    expect(screen.getByText("Create Task")).toBeVisible();
  });

  it("renders the cancel button", () => {
    render(<TaskForm {...mockProps} />);

    expect(screen.getByText("Cancel")).toBeVisible();
  });

  it("renders with existing task data", () => {
    render(<TaskForm {...mockProps} task={mockTask} />);

    expect(screen.getByLabelText("Title")).toHaveValue(mockTask.title);
    expect(screen.getByLabelText("Description")).toHaveValue(
      mockTask.description
    );
    expect(screen.getByText("Save Task")).toBeVisible();
  });
});

describe("actions", () => {
  it("calls onSubmit with new task data when form is submitted", () => {
    render(<TaskForm {...mockProps} />);

    const title = "New Task Title";
    const description = "New Task Description";

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: title },
    });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: description },
    });
    fireEvent.submit(screen.getByTestId("task-form"));

    expect(mockProps.onSubmit).toHaveBeenCalledWith({
      title,
      description,
      status: TaskStatus.TODO,
    });
  });

  it("calls onSubmit with updated task data when editing", () => {
    render(<TaskForm {...mockProps} task={mockTask} />);

    const newTitle = "Updated Task Title";
    const newDescription = "Updated Task Description";

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: newTitle },
    });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: newDescription },
    });
    fireEvent.submit(screen.getByTestId("task-form"));

    expect(mockProps.onSubmit).toHaveBeenCalledWith({
      ...mockTask,
      title: newTitle,
      description: newDescription,
    });
  });

  it("calls onCancel when cancel button is clicked", () => {
    render(<TaskForm {...mockProps} />);
    fireEvent.click(screen.getByText("Cancel"));
    expect(mockProps.onCancel).toHaveBeenCalled();
  });

  it("trims whitespace from title and description on submit", () => {
    render(<TaskForm {...mockProps} />);

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "  Task Title  " },
    });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "  Task Description  " },
    });
    fireEvent.submit(screen.getByTestId("task-form"));

    expect(mockProps.onSubmit).toHaveBeenCalledWith({
      title: "Task Title",
      description: "Task Description",
      status: TaskStatus.TODO,
    });
  });
});
