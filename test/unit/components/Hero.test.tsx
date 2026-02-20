import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Hero } from "@/components/Hero";

let mockShowInternalToolLabel = false;
vi.mock("@/config/app", () => ({
  get showInternalToolLabel() {
    return mockShowInternalToolLabel;
  },
  getSignInPrompt: () => "Sign in with your work email.",
}));

describe("Hero", () => {
  beforeEach(() => {
    mockShowInternalToolLabel = false;
  });

  it("renders main heading and sign-in prompt", () => {
    render(
      <MemoryRouter>
        <Hero />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: /find your teammates on the map/i })).toBeInTheDocument();
    expect(screen.getByText(/Sign in with your work email/)).toBeInTheDocument();
  });

  it('does not show "Internal Tool" when showInternalToolLabel is false', () => {
    render(
      <MemoryRouter>
        <Hero />
      </MemoryRouter>
    );

    expect(screen.queryByText("Internal Tool")).not.toBeInTheDocument();
  });

  it('shows "Internal Tool" when showInternalToolLabel is true', () => {
    mockShowInternalToolLabel = true;

    render(
      <MemoryRouter>
        <Hero />
      </MemoryRouter>
    );

    expect(screen.getByText("Internal Tool")).toBeInTheDocument();
  });
});
