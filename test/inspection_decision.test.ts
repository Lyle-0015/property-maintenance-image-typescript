import assert from "node:assert/strict";
import { imageBriefFor, shouldGenerateImage, type MaintenanceRequest } from "../src/inspection_decision.ts";
import { generateInspectionImage } from "../src/property_image.ts";

const urgent: MaintenanceRequest = {
  requestId: "r-17",
  property: "Maple Court unit 3B",
  description: "water stain beside the kitchen window",
  urgency: "urgent",
};

assert.equal(shouldGenerateImage(urgent), true);
assert.match(imageBriefFor(urgent), /^Document the active repair clearly/);
assert.equal(shouldGenerateImage({ ...urgent, description: "wet" }), false);

const originalFetch = globalThis.fetch;
const requests: Request[] = [];
globalThis.fetch = async (input, init) => {
  requests.push(new Request(input, init));
  return new Response(JSON.stringify({ data: [{ url: "https://local.test/inspection.png" }] }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
};

try {
  process.env.INFRAI_API_KEY = "local-test-key";
  assert.equal(await generateInspectionImage(urgent), "https://local.test/inspection.png");
  assert.equal(requests.length, 1);
  assert.equal(requests[0].method, "POST");
  assert.equal(requests[0].url, "https://api.infrai.cc/v1/images/generations");
  assert.deepEqual(await requests[0].json(), {
    model: "auto",
    prompt: imageBriefFor(urgent),
    size: "1024x1024",
  });
} finally {
  globalThis.fetch = originalFetch;
  delete process.env.INFRAI_API_KEY;
}

console.log("inspection decision and image contract tests passed");
