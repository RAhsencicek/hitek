import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HiStatusBadge, STATUS_MAP, HiWorkOrderStatus } from "@/components/ui/HiStatusBadge";
import React from "react";

describe("HiStatusBadge", () => {
  it("renders all 8 statuses from the contract with non-color labels and icons", () => {
    const statuses = Object.keys(STATUS_MAP) as HiWorkOrderStatus[];

    statuses.forEach((status) => {
      const { unmount } = render(<HiStatusBadge status={status} />);
      const config = STATUS_MAP[status];
      expect(screen.getByText(config.label)).toBeDefined();
      unmount();
    });
  });

  it("applies fast red pulse animation to QUARANTINE_REVIEW status", () => {
    const { container } = render(<HiStatusBadge status="QUARANTINE_REVIEW" />);
    const badge = container.querySelector("[role='status']");
    expect(badge?.className).toContain("animate-fast-pulse");
    expect(badge?.className).toContain("ring-rose-500");
  });

  it("applies slow pulse animation to InProgress status", () => {
    const { container } = render(<HiStatusBadge status="InProgress" />);
    const badge = container.querySelector("[role='status']");
    expect(badge?.className).toContain("animate-slow-pulse");
  });
});
