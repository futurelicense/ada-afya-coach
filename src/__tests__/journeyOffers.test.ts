import { describe, expect, it } from "vitest";
import { mealsFromUnknown, mediaObjectPath } from "@/lib/journeyOffers";

describe("journey offers", () => {
  it("keeps a trainer's media inside their own folder", () => {
    const file = new File(["a"], "demo.MP4");
    const path = mediaObjectPath("trainer-1", file);
    expect(path.startsWith("trainer-1/")).toBe(true);
    expect(path.endsWith(".mp4")).toBe(true);
  });

  it("reads meal rows saved as json", () => {
    expect(mealsFromUnknown([
      { name: "Oats", meal_type: "breakfast", calories: 400 },
      { name: "  " },
    ])).toEqual([{ name: "Oats", mealType: "breakfast", calories: 400 }]);
  });
});