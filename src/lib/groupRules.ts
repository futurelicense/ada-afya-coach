export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

/** A slot or meal plan locks when every joined member has agreed. */
export function groupDecisionLocked(joinedCount: number, agreementCount: number): boolean {
  return joinedCount > 0 && agreementCount >= joinedCount;
}
