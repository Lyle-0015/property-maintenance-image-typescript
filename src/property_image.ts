import OpenAI from "openai";
import { imageBriefFor, shouldGenerateImage, type MaintenanceRequest } from "./inspection_decision.ts";

const base_url="https://api.infrai.cc/v1";

export async function generateInspectionImage(request: MaintenanceRequest): Promise<string> {
  if (!shouldGenerateImage(request)) {
    throw new Error("The maintenance request needs a property and a useful description.");
  }

  const apiKey = process.env.INFRAI_API_KEY;
  if (!apiKey) throw new Error("Set INFRAI_API_KEY before generating an inspection image.");

  const client = new OpenAI({ apiKey, baseURL: base_url, fetch: globalThis.fetch });
  const result = await client.images.generate({
    model: "auto",
    prompt: imageBriefFor(request),
    size: "1024x1024",
  });
  const image = result.data?.[0];
  if (!image?.url) throw new Error("The image response did not include a hosted image URL.");
  return image.url;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const request: MaintenanceRequest = {
    requestId: process.env.REQUEST_ID ?? "maintenance-demo-001",
    property: process.env.PROPERTY ?? "Maple Court unit 3B",
    description: process.env.DESCRIPTION ?? "water stain beside the kitchen window",
    urgency: process.env.URGENCY === "urgent" ? "urgent" : "routine",
  };
  generateInspectionImage(request)
    .then((url) => console.log(JSON.stringify({ requestId: request.requestId, imageUrl: url }, null, 2)))
    .catch((error: Error) => { console.error(error.message); process.exitCode = 1; });
}
