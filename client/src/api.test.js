import { afterEach, describe, expect, it } from "vitest";
import { API_URL, getToken, setToken } from "./api";

describe("api token helpers", () => {
  afterEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it("defaults the API origin to the local HTTPS server", () => {
    expect(API_URL).toBe("https://localhost:3000");
  });

  it("stores and clears the JWT in sessionStorage under hh_token", () => {
    setToken("abc.def.ghi");
    expect(getToken()).toBe("abc.def.ghi");
    expect(sessionStorage.getItem("hh_token")).toBe("abc.def.ghi");
    expect(localStorage.getItem("hh_token")).toBeNull();

    setToken(null);
    expect(getToken()).toBeNull();
  });
});
