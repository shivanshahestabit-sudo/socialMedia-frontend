import React from "react";
import { render } from "@testing-library/react";
import FlexBetween from "../FlexBetween";

describe("FlexBetween Component", () => {
  test("renders children correctly", () => {
    const { getByText } = render(
      <FlexBetween>
        <span>Left</span>
        <span>Right</span>
      </FlexBetween>
    );

    expect(getByText("Left")).toBeInTheDocument();
    expect(getByText("Right")).toBeInTheDocument();
  });

  test("applies flex styling", () => {
    const { container } = render(<FlexBetween>Content</FlexBetween>);
    const flexBox = container.firstChild;

    expect(flexBox).toHaveStyle({
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    });
  });
});
