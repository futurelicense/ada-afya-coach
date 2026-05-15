import {
  GYMS,
  TRAINERS,
  NUTRITIONISTS,
  STORES,
  FITNESS_EVENTS,
  WORKOUT_SPOTS,
  INFLUENCERS,
  INITIAL_ORDERS,
  INITIAL_MENU,
  EMPLOYEES,
  PROGRAMS,
  INVOICES,
  DEPT_SCORES,
  WEEKLY_PARTICIPATION,
} from "@/lib/mockData";

describe("mockData – shape & integrity", () => {
  describe("Explore data", () => {
    it("GYMS has required fields", () => {
      expect(GYMS.length).toBeGreaterThan(0);
      GYMS.forEach((g) => {
        expect(g).toHaveProperty("id");
        expect(g).toHaveProperty("name");
        expect(g).toHaveProperty("location");
        expect(g).toHaveProperty("rating");
        expect(g).toHaveProperty("amenities");
        expect(Array.isArray(g.amenities)).toBe(true);
        expect(g.rating).toBeGreaterThanOrEqual(0);
        expect(g.rating).toBeLessThanOrEqual(5);
      });
    });

    it("TRAINERS have valid pricePerSession", () => {
      TRAINERS.forEach((t) => {
        expect(typeof t.pricePerSession).toBe("number");
        expect(t.pricePerSession).toBeGreaterThan(0);
      });
    });

    it("NUTRITIONISTS have valid consultationFee", () => {
      NUTRITIONISTS.forEach((n) => {
        expect(typeof n.consultationFee).toBe("number");
        expect(n.consultationFee).toBeGreaterThan(0);
      });
    });

    it("STORES have delivery flag as boolean", () => {
      STORES.forEach((s) => {
        expect(typeof s.delivery).toBe("boolean");
        expect(Array.isArray(s.products)).toBe(true);
      });
    });

    it("FITNESS_EVENTS have organizer", () => {
      FITNESS_EVENTS.forEach((e) => {
        expect(e.organizer).toBeTruthy();
        expect(typeof e.attendees).toBe("number");
      });
    });

    it("WORKOUT_SPOTS have free flag as boolean", () => {
      WORKOUT_SPOTS.forEach((s) => {
        expect(typeof s.free).toBe("boolean");
      });
    });

    it("INFLUENCERS have platform", () => {
      INFLUENCERS.forEach((i) => {
        expect(i.platform).toBeTruthy();
        expect(i.followers).toBeTruthy();
      });
    });
  });

  describe("Vendor data", () => {
    it("INITIAL_ORDERS have valid statuses", () => {
      const validStatuses = ["pending", "confirmed", "preparing", "ready", "delivered", "cancelled"];
      INITIAL_ORDERS.forEach((o) => {
        expect(validStatuses).toContain(o.status);
      });
    });

    it("INITIAL_MENU items have positive calories", () => {
      INITIAL_MENU.forEach((m) => {
        expect(m.calories).toBeGreaterThanOrEqual(0);
        expect(typeof m.available).toBe("boolean");
      });
    });
  });

  describe("Corporate data", () => {
    it("EMPLOYEES have scores between 0 and 100", () => {
      EMPLOYEES.forEach((e) => {
        expect(e.score).toBeGreaterThanOrEqual(0);
        expect(e.score).toBeLessThanOrEqual(100);
      });
    });

    it("EMPLOYEES have valid statuses", () => {
      const validStatuses = ["active", "at-risk", "inactive"];
      EMPLOYEES.forEach((e) => {
        expect(validStatuses).toContain(e.status);
      });
    });

    it("PROGRAMS have valid statuses", () => {
      const validStatuses = ["active", "completed", "upcoming"];
      PROGRAMS.forEach((p) => {
        expect(validStatuses).toContain(p.status);
        expect(p.completion).toBeGreaterThanOrEqual(0);
        expect(p.completion).toBeLessThanOrEqual(100);
      });
    });

    it("INVOICES have valid statuses", () => {
      INVOICES.forEach((inv) => {
        expect(["paid", "pending"]).toContain(inv.status);
        expect(inv.amount).toMatch(/₦/);
      });
    });

    it("DEPT_SCORES have scores between 0 and 100", () => {
      DEPT_SCORES.forEach((d) => {
        expect(d.score).toBeGreaterThanOrEqual(0);
        expect(d.score).toBeLessThanOrEqual(100);
      });
    });

    it("WEEKLY_PARTICIPATION has 7 days", () => {
      expect(WEEKLY_PARTICIPATION).toHaveLength(7);
      WEEKLY_PARTICIPATION.forEach((d) => {
        expect(d.value).toBeGreaterThanOrEqual(0);
        expect(d.value).toBeLessThanOrEqual(100);
      });
    });
  });
});
