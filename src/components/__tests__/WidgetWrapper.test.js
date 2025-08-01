import React from "react";
import { render } from "@testing-library/react";
import { renderWithProviders } from "../../__tests__/utils/testUtils";
import WidgetWrapper from "../WidgetWrapper";

describe("WidgetWrapper Component", () => {
  test("renders children correctly", () => {
    const { getByText } = renderWithProviders(
      <WidgetWrapper>
        <div>Widget Content</div>
      </WidgetWrapper>
    );

    expect(getByText("Widget Content")).toBeInTheDocument();
  });

  test("applies correct styling", () => {
    const { container } = renderWithProviders(
      <WidgetWrapper>Content</WidgetWrapper>
    );

    const wrapper = container.firstChild;
    expect(wrapper).toHaveStyle({
      padding: "1.5rem 1.5rem 0.75rem 1.5rem",
    });
  });
});
