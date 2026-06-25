import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const checkedFiles = [
  "package.json",
  "src/cli.ts",
  "src/fetch.ts",
  "src/harvest.ts",
  "src/mcp-client.ts",
  "src/server.ts",
];

describe("no shared cloud package boundary", () => {
  test("runtime files do not depend on @hasna/cloud or open-cloud", () => {
    const combined = checkedFiles
      .map((file) => readFileSync(join(process.cwd(), file), "utf8"))
      .join("\n");

    expect(combined).not.toMatch(/@hasna\/cloud|open-cloud|HASNA_UI_CLOUD|UI_CLOUD/);
  });
});
