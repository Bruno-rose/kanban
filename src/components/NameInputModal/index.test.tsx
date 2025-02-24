import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import NameInputModal from "./index";

describe("NameInputModal", () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("render", () => {
    it("renders the title", () => {
      render(<NameInputModal onSubmit={mockOnSubmit} />);

      expect(screen.getByText("Enter Your Name")).toBeVisible();
    });

    it("renders the input field", () => {
      render(<NameInputModal onSubmit={mockOnSubmit} />);

      expect(screen.getByPlaceholderText("Your name")).toBeVisible();
    });

    it("renders the submit button", () => {
      render(<NameInputModal onSubmit={mockOnSubmit} />);

      expect(screen.getByText("Start Using Kanban")).toBeVisible();
    });
  });

  describe("actions", () => {
    it("updates input value when typing", () => {
      render(<NameInputModal onSubmit={mockOnSubmit} />);

      const input = screen.getByTestId("name-input");
      fireEvent.change(input, { target: { value: "John Doe" } });

      expect(input).toHaveValue("John Doe");
    });

    it("calls onSubmit with trimmed name when form is submitted", () => {
      render(<NameInputModal onSubmit={mockOnSubmit} />);

      const input = screen.getByTestId("name-input");
      fireEvent.change(input, { target: { value: "  John Doe  " } });
      fireEvent.submit(screen.getByTestId("name-form"));

      expect(mockOnSubmit).toHaveBeenCalledWith("John Doe");
    });

    it("does not call onSubmit when name is empty", () => {
      render(<NameInputModal onSubmit={mockOnSubmit} />);

      fireEvent.submit(screen.getByTestId("name-form"));

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("does not call onSubmit when name is only whitespace", () => {
      render(<NameInputModal onSubmit={mockOnSubmit} />);

      const input = screen.getByTestId("name-input");
      fireEvent.change(input, { target: { value: "   " } });
      fireEvent.submit(screen.getByTestId("name-form"));

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });
});
