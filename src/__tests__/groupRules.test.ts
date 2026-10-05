import { describe, expect, it } from "vitest";
import { groupDecisionLocked } from "@/lib/groupRules";

describe("group decisions", () => {
  it("locks only after every joined member agrees", () => {
    expect(groupDecisionLocked(0, 0)).toBe(false);
    expect(groupDecisionLocked(3, 2)).toBe(false);
    expect(groupDecisionLocked(3, 3)).toBe(true);
  });
});