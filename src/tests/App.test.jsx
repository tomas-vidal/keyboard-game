import { it, describe, afterEach, beforeEach, vi, expect } from "vitest";
import App from "../App";
import {
  render,
  screen,
  cleanup,
  act,
  fireEvent,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("App", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    render(<App />);
  });

  afterEach(() => cleanup());

  it("render", () => {
    render(<App />);
  });

  it("should start counter when clicked", async () => {
    const button = screen.getByText("START");
    const counter = screen.getByRole("counter");
    const msAdvanceTime = 2000;
    const expected = Number(counter.textContent) - msAdvanceTime / 1000;
    await userEvent.click(button);
    act(() => {
      vi.advanceTimersByTime(msAdvanceTime);
    });
    expect(Number(counter.textContent)).toBe(expected);
  });

  it("should add one to correct counter", async () => {
    const button = screen.getByText("START");
    const input = screen.getByRole("input-text");
    const textGenerator = screen.getByRole("text-generator");
    await userEvent.click(button);
    await userEvent.type(input, textGenerator.firstChild.textContent);
    fireEvent.keyDown(input, {
      key: "Space",
      code: "Space",
      charCode: 32,
      keyCode: 32,
    });

    const correct = screen.getByRole("correct-counter");
    expect(Number(correct.textContent)).toBe(1);
  });

  it("should add one to incorrect counter", async () => {
    const button = screen.getByText("START");
    const input = screen.getByRole("input-text");
    await userEvent.click(button);
    fireEvent.keyDown(input, {
      key: "Space",
      code: "Space",
      charCode: 32,
      keyCode: 32,
    });

    const incorrect = screen.getByRole("incorrect-counter");
    expect(Number(incorrect.textContent)).toBe(1);
  });
});
