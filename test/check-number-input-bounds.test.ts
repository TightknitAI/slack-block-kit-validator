import { checkNumberInputBounds } from "../src/helpers/check-number-input-bounds";

describe("checkNumberInputBounds", () => {
  it("returns no errors when min <= max", () => {
    expect(
      checkNumberInputBounds([
        {
          type: "input",
          element: {
            type: "number_input",
            is_decimal_allowed: false,
            min_value: "0",
            max_value: "100",
          },
        },
      ]),
    ).toEqual([]);
  });

  it("returns no errors when min == max", () => {
    expect(
      checkNumberInputBounds([
        {
          type: "input",
          element: {
            type: "number_input",
            is_decimal_allowed: false,
            min_value: "5",
            max_value: "5",
          },
        },
      ]),
    ).toEqual([]);
  });

  it("flags min_value greater than max_value", () => {
    const errors = checkNumberInputBounds([
      {
        type: "input",
        element: {
          type: "number_input",
          is_decimal_allowed: false,
          min_value: "10",
          max_value: "1",
        },
      },
    ]);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("min_value (10)");
    expect(errors[0]).toContain("max_value (1)");
  });

  it("handles decimal bounds", () => {
    const errors = checkNumberInputBounds([
      {
        type: "input",
        element: {
          type: "number_input",
          is_decimal_allowed: true,
          min_value: "1.5",
          max_value: "0.25",
        },
      },
    ]);
    expect(errors).toHaveLength(1);
  });

  it("skips when either bound is missing", () => {
    expect(
      checkNumberInputBounds([
        {
          type: "input",
          element: {
            type: "number_input",
            is_decimal_allowed: false,
            min_value: "10",
          },
        },
        {
          type: "input",
          element: {
            type: "number_input",
            is_decimal_allowed: false,
            max_value: "5",
          },
        },
      ]),
    ).toEqual([]);
  });

  it("skips non-numeric bounds", () => {
    expect(
      checkNumberInputBounds([
        {
          type: "input",
          element: {
            type: "number_input",
            is_decimal_allowed: false,
            min_value: "abc",
            max_value: "xyz",
          },
        },
      ]),
    ).toEqual([]);
  });

  it("walks nested actions-block elements", () => {
    const errors = checkNumberInputBounds([
      {
        type: "actions",
        elements: [
          {
            type: "number_input",
            is_decimal_allowed: false,
            min_value: "100",
            max_value: "0",
          },
        ],
      },
    ]);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("blocks[0].elements[0]");
  });

  it("accepts an empty array", () => {
    expect(checkNumberInputBounds([])).toEqual([]);
  });

  describe("integer-only bounds when is_decimal_allowed is false", () => {
    it("flags a decimal min_value", () => {
      const errors = checkNumberInputBounds([
        {
          type: "input",
          element: {
            type: "number_input",
            is_decimal_allowed: false,
            min_value: "1.5",
            max_value: "10",
          },
        },
      ]);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain("min_value ('1.5')");
      expect(errors[0]).toContain("must be an integer");
    });

    it("flags a decimal max_value", () => {
      const errors = checkNumberInputBounds([
        {
          type: "input",
          element: {
            type: "number_input",
            is_decimal_allowed: false,
            min_value: "0",
            max_value: "9.9",
          },
        },
      ]);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain("max_value ('9.9')");
    });

    it("flags a decimal initial_value", () => {
      const errors = checkNumberInputBounds([
        {
          type: "input",
          element: {
            type: "number_input",
            is_decimal_allowed: false,
            initial_value: "3.14",
          },
        },
      ]);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain("initial_value ('3.14')");
    });

    it("allows decimals when is_decimal_allowed is true", () => {
      expect(
        checkNumberInputBounds([
          {
            type: "input",
            element: {
              type: "number_input",
              is_decimal_allowed: true,
              min_value: "0.5",
              max_value: "9.5",
              initial_value: "1.25",
            },
          },
        ]),
      ).toEqual([]);
    });

    it("does not flag integer strings when is_decimal_allowed is false", () => {
      expect(
        checkNumberInputBounds([
          {
            type: "input",
            element: {
              type: "number_input",
              is_decimal_allowed: false,
              min_value: "0",
              max_value: "100",
              initial_value: "42",
            },
          },
        ]),
      ).toEqual([]);
    });
  });
});
