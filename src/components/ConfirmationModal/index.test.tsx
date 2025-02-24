import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ConfirmationModal from "./index";

const mockProps = {
  isOpen: true,
  onConfirm: jest.fn(),
  onCancel: jest.fn(),
  title: "Test Title",
  message: "Test Message",
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("render", () => {
  it("renders nothing when isOpen is false", () => {
    render(<ConfirmationModal {...mockProps} isOpen={false} />);

    expect(screen.queryByText(mockProps.title)).not.toBeInTheDocument();
  });

  it("renders title and message when isOpen is true", () => {
    render(<ConfirmationModal {...mockProps} />);

    expect(screen.getByText(mockProps.title)).toBeVisible();
    expect(screen.getByText(mockProps.message)).toBeVisible();
  });

  it("renders action buttons when isOpen is true", () => {
    render(<ConfirmationModal {...mockProps} />);

    expect(screen.getByText("Cancel")).toBeVisible();
    expect(screen.getByText("Delete")).toBeVisible();
  });
});

describe("actions", () => {
  it("calls onConfirm when confirm button is clicked", () => {
    render(<ConfirmationModal {...mockProps} />);

    const confirmButton = screen.getByTestId("confirm-delete-button");
    fireEvent.click(confirmButton);

    expect(mockProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when cancel button is clicked", () => {
    render(<ConfirmationModal {...mockProps} />);

    const cancelButton = screen.getByTestId("cancel-delete-button");
    fireEvent.click(cancelButton);

    expect(mockProps.onCancel).toHaveBeenCalledTimes(1);
  });
});
