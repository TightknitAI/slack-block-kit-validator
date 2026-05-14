import { checkResponseUrlEnabledContext } from "../src/helpers/check-response-url-enabled-context";

describe("checkResponseUrlEnabledContext", () => {
  it("returns no errors when no select has response_url_enabled", () => {
    expect(
      checkResponseUrlEnabledContext(
        [
          {
            type: "input",
            element: { type: "conversations_select" },
          },
        ],
        "modal",
      ),
    ).toEqual([]);
  });

  it("accepts response_url_enabled on conversations_select in a modal input block", () => {
    expect(
      checkResponseUrlEnabledContext(
        [
          {
            type: "input",
            element: {
              type: "conversations_select",
              response_url_enabled: true,
            },
          },
        ],
        "modal",
      ),
    ).toEqual([]);
  });

  it("accepts response_url_enabled on channels_select in a modal input block", () => {
    expect(
      checkResponseUrlEnabledContext(
        [
          {
            type: "input",
            element: { type: "channels_select", response_url_enabled: true },
          },
        ],
        "modal",
      ),
    ).toEqual([]);
  });

  it("rejects response_url_enabled on non-modal surface (home)", () => {
    const errors = checkResponseUrlEnabledContext(
      [
        {
          type: "input",
          element: { type: "conversations_select", response_url_enabled: true },
        },
      ],
      "home",
    );
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("'home'");
  });

  it("rejects response_url_enabled in a section accessory even on modal surface", () => {
    const errors = checkResponseUrlEnabledContext(
      [
        {
          type: "section",
          accessory: {
            type: "conversations_select",
            response_url_enabled: true,
          },
        },
      ],
      "modal",
    );
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("accessory");
  });

  it("rejects response_url_enabled in an actions block element even on modal surface", () => {
    const errors = checkResponseUrlEnabledContext(
      [
        {
          type: "actions",
          elements: [{ type: "channels_select", response_url_enabled: true }],
        },
      ],
      "modal",
    );
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("elements[0]");
  });

  it("does not flag response_url_enabled: false", () => {
    expect(
      checkResponseUrlEnabledContext(
        [
          {
            type: "input",
            element: {
              type: "conversations_select",
              response_url_enabled: false,
            },
          },
        ],
        "home",
      ),
    ).toEqual([]);
  });

  it("does not flag other select types (e.g. static_select)", () => {
    // response_url_enabled is not a field on static_select; if someone adds it
    // anyway the schema rejects it structurally. The helper only guards the
    // two select types that actually accept the field.
    expect(
      checkResponseUrlEnabledContext(
        [
          {
            type: "input",
            element: { type: "static_select", response_url_enabled: true },
          },
        ],
        "home",
      ),
    ).toEqual([]);
  });

  it("accepts an empty blocks array", () => {
    expect(checkResponseUrlEnabledContext([], "modal")).toEqual([]);
  });

  it("flags response_url_enabled on an input block when surface is undefined (cannot confirm modal)", () => {
    const errors = checkResponseUrlEnabledContext(
      [
        {
          type: "input",
          element: {
            type: "conversations_select",
            response_url_enabled: true,
          },
        },
      ],
      undefined,
    );
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("unspecified");
  });

  it("still flags section/actions response_url_enabled when surface is undefined", () => {
    const errors = checkResponseUrlEnabledContext(
      [
        {
          type: "section",
          accessory: {
            type: "conversations_select",
            response_url_enabled: true,
          },
        },
        {
          type: "actions",
          elements: [{ type: "channels_select", response_url_enabled: true }],
        },
      ],
      undefined,
    );
    expect(errors).toHaveLength(2);
  });
});
