#!/usr/bin/env bun
// ui (@hasna/ui) CLI — offline replacement for the ui.sh MCP fetch tool.
//
//   ui fetch uidotsh://ui
//   ui fetch uidotsh://ui/design-guidelines/buttons uidotsh://ui/ideas
//   ui list                 # list all mirrored resource URIs
//   ui serve [port]         # start the local preview/picker server
//
// Reads from the mirrored content/ tree — no network, no remote picker.

import { join } from "node:path";
import { assertContentMirror, resolveContentDir } from "./content.ts";
import { fetchResource } from "./fetch.ts";
import { harvest } from "./harvest.ts";
import { runEventsCli } from "@hasna/events/cli";

async function listUris(): Promise<string[]> {
  const contentDir = resolveContentDir();
  await assertContentMirror(contentDir);
  const idx = (await Bun.file(join(contentDir, "index.json")).json()) as Record<string, string>;
  return Object.keys(idx).sort();
}

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  switch (cmd) {
    case "events":
    case "webhooks": {
      await runEventsCli(process.argv.slice(2), { source: "ui", programName: "ui" });
      break;
    }
    case "fetch": {
      if (!rest.length) {
        console.error("usage: ui fetch <uidotsh://...> [more uris]");
        process.exit(1);
      }
      const out = rest.length === 1 ? await fetchResource({ uri: rest[0] }) : await fetchResource({ uris: rest });
      console.log(out);
      break;
    }
    case "list": {
      const uris = await listUris();
      console.log(uris.join("\n"));
      console.error(`\n${uris.length} resources`);
      break;
    }
    case "harvest": {
      await harvest({ contentDir: rest[0] });
      break;
    }
    case "serve": {
      const port = rest[0] ? Number(rest[0]) : 5173;
      process.env.UI_LOCAL_PORT = String(port);
      await import("./server.ts");
      break;
    }
    default:
      console.error("ui (@hasna/ui) — offline ui.sh\n  commands: fetch <uri...>, list, harvest [content-dir], serve [port], events, webhooks");
      process.exit(cmd ? 1 : 0);
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
