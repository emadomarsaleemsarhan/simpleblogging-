import { describe, expect, it } from "vitest";
import Home from "../../src/app/page";
import { metadata } from "../../src/app/layout";

describe("scaffold", () => {
  it("defines the expected app metadata", () => {
    expect(metadata.title).toBe("Blog Publisher");
    expect(metadata.description).toBe("A lightweight publishing workflow for prepared blog content.");
  });

  it("renders the homepage component", () => {
    expect(Home()).toMatchObject({
      type: "main",
      props: {
        children: {
          type: "h1",
          props: {
            children: "Blog Publisher"
          }
        }
      }
    });
  });
});
