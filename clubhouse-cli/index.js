#!/usr/bin/env node
import { run } from "./src/client.js";
run().catch((e) => {
  console.error("clubhouse error:", e?.message || e);
  process.exit(1);
});
