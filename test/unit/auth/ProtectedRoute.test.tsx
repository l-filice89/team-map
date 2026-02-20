import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ProtectedRoute } from "@/auth/ProtectedRoute";

vi.mock("@/auth/AuthContext", () => ({
  useAuth: vi.fn(),
}));

const { useAuth } = await import("@/auth/AuthContext");

describe("ProtectedRoute", () => {
  it("shows loading skeleton when loading is true", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      session: null,
      loading: true,
      authError: null,
      signInWithGoogle: vi.fn(),
      signOut: vi.fn(),
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <span>Protected content</span>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
    expect(document.querySelector(".space-y-4")).toBeInTheDocument();
  });

  it("does not render children when not loading and no user (redirects to signin)", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      session: null,
      loading: false,
      authError: null,
      signInWithGoogle: vi.fn(),
      signOut: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/app"]}>
        <ProtectedRoute>
          <span>Protected content</span>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });

  it("renders children when user is present", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: "1",
        email: "u@test.com",
        displayName: "User",
        avatarUrl: "",
      },
      session: {} as any,
      loading: false,
      authError: null,
      signInWithGoogle: vi.fn(),
      signOut: vi.fn(),
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <span>Protected content</span>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText("Protected content")).toBeInTheDocument();
  });
});
