import { describe, expect, it } from "vitest";
import { __prefixKeyForTests as prefixKey } from "../src/rate-limit.js";

describe("rate-limit prefix key (IPv6 /64 truncation)", () => {
  it("passes IPv4 addresses through unchanged", () => {
    expect(prefixKey("203.0.113.42")).toBe("203.0.113.42");
    expect(prefixKey("10.0.0.1")).toBe("10.0.0.1");
  });

  it("collapses an IPv6 address to its first 4 groups", () => {
    expect(prefixKey("2001:db8:0:0:1:2:3:4")).toBe("2001:db8:0:0");
    expect(prefixKey("fe80:0:0:0:a:b:c:d")).toBe("fe80:0:0:0");
  });

  it("collapses two addresses in the same /64 to the same key", () => {
    expect(prefixKey("2001:db8::1")).toBe(prefixKey("2001:db8::ffff"));
    expect(prefixKey("2001:db8::1")).toBe(prefixKey("2001:db8:0:0:abcd:1234:5678:9abc"));
  });

  it("expands :: shorthand correctly", () => {
    expect(prefixKey("2001:db8::")).toBe("2001:db8:0:0");
    expect(prefixKey("::1")).toBe("0:0:0:0");
    expect(prefixKey("2001::1")).toBe("2001:0:0:0");
  });

  it("treats different /64 prefixes as different keys", () => {
    expect(prefixKey("2001:db8:1::1")).not.toBe(prefixKey("2001:db8:2::1"));
  });
});
