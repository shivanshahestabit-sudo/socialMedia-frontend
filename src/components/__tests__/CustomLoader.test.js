import React from "react";
import { render, screen } from "@testing-library/react";
import CustomLoader from "../CustomLoader";

describe("CustomLoader Component", () => {
  test("renders loading spinner", () => {
    render(<CustomLoader />);
    const loader = screen.getByRole("progressbar");
    expect(loader).toBeInTheDocument();
  });

  test("displays loading text when provided", () => {
    render(<CustomLoader text="Loading posts..." />);
    expect(screen.getByText("Loading posts...")).toBeInTheDocument();
  });

  test("applies custom className", () => {
    const { container } = render(<CustomLoader className="custom-loader" />);
    expect(container.firstChild).toHaveClass("custom-loader");
  });
});
