import React from "react";
import { screen } from "@testing-library/react";
import { render } from "./__tests__/utils/testUtils";
import App from "./App";

// Mock the scenes
jest.mock("./scenes/homePage", () => () => (
  <div data-testid="home-page">Home Page</div>
));
jest.mock("./scenes/loginPage", () => () => (
  <div data-testid="login-page">Login Page</div>
));
jest.mock("./scenes/profilePage", () => () => (
  <div data-testid="profile-page">Profile Page</div>
));

describe("App Component", () => {
  test("renders without crashing", () => {
    render(<App />);
    expect(document.body).toBeInTheDocument();
  });

  test("renders login page when not authenticated", () => {
    render(<App />, {
      initialState: {
        auth: { user: null, token: null, posts: [] },
      },
    });
    expect(screen.getByTestId("login-page")).toBeInTheDocument();
  });

  test("renders home page when authenticated", () => {
    render(<App />, {
      initialState: {
        auth: {
          user: { _id: "123", firstName: "John" },
          token: "token123",
          posts: [],
        },
      },
    });
    expect(screen.getByTestId("home-page")).toBeInTheDocument();
  });
});
