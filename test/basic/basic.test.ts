import talc from "./../../src/talc";

test("talc to correctly parse and output a basic script", () => {
  expect(talc(["talc", "say", "now"], "./test/basic"));
});
