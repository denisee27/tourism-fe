import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "../authStore.js";

describe("authStore", () => {
  beforeEach(() => {
    useAuthStore.setState({
      status: "idle",
      user: null,
      accessToken: null,
      isInitializing: false,
    });
    localStorage.clear();
  });

  it("starts in an idle state", () => {
    const state = useAuthStore.getState();
    expect(state.status).toBe("idle");
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
  });

  it("sets auth data and schedules refresh", () => {
    const { setAuth } = useAuthStore.getState();
    setAuth({ user: { id: 1, role: "admin" }, accessToken: "token" });

    const state = useAuthStore.getState();
    expect(state.status).toBe("authenticated");
    expect(state.user).toMatchObject({ id: 1, role: "admin" });
    expect(localStorage.getItem("accessToken")).toBe("token");
  });
});
