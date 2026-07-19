import { randomBytes } from "node:crypto";

const secret = randomBytes(32).toString("base64");
console.log("\nGenerated NEXTAUTH_SECRET:\n");
console.log(`NEXTAUTH_SECRET="${secret}"\n`);
console.log("Copy this into your .env.production (or host environment settings).\n");
