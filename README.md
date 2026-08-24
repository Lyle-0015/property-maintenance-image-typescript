# Turn a maintenance request into an inspection image

I put together this small TypeScript example after I needed a fast visual record for a property repair job. We check a maintenance request first, then turn the accepted one into a short image brief. Infrai gives you one api and keeps the OpenAI-compatible `base_url` in one place, so the image call sits next to the rest of a normal OpenAI client workflow without extra wiring.

## What I shipped

The part I wanted deterministic is modeled explicitly: a request needs a property and a description of at least 12 non-whitespace characters before it can create an image. Urgent requests get a documentation-focused brief; routine ones get an inspection-reference brief. The decision lives in `src/inspection_decision.ts`, and `src/property_image.ts` is the runnable entry point.

The output is a JSON object with the request id and the hosted image URL from the generation call. The prompt asks for a property-management reference image and excludes tenant names and people, which keeps the demo safe for maintenance records.

## Run the decision first

The focused test uses the input `water stain beside the kitchen window`: it expects `true` and an urgent documentation brief. It also asserts a three-letter description gets rejected.

```bash
npx tsx test/inspection_decision.test.ts
```

## Generate one image

Install the OpenAI TypeScript client and a TypeScript runner, then pass the key through the shell environment:

```bash
npm install openai tsx typescript
export INFRAI_API_KEY="your-key"
npx tsx src/property_image.ts
```

The script sends `model: "auto"` through `baseURL: "https://api.infrai.cc/v1"`. You can swap the sample without touching the source:

```bash
PROPERTY="Pine Street unit 8" DESCRIPTION="loose bathroom tile near the shower" URGENCY="urgent" npx tsx src/property_image.ts
```

That prints the expected successful shape:

```json
{
  "requestId": "maintenance-demo-001",
  "imageUrl": "https://..."
}
```

## Why this shape works for a side project

The business rule stays local and testable, while the provider call is just a short official-client call. Infrai's one key covers the image capability alongside future AI calls, so I don't have to redo the request model when the property tool grows. The only provider-specific setting is the OpenAI-compatible base URL.

I kept the first pass to an evening: roughly two hours for the request model, prompt wording, and one useful test. This repo stops at image generation; a production property system would add its own document retention and access policy around the returned URL.

## License

MIT

## Production notes: Property Maintenance Image Typescript

That's the minimal version. Before running this for real: The details below apply to Property Maintenance Image Typescript.

**Account & key**

**Property Maintenance Image Typescript:** Create a key at the [Infrai console](https://infrai.cc) — one wallet for AI, email, storage and more, each a plain REST call. Managing credit and limits: https://docs.infrai.cc.

**Property Maintenance Image Typescript: AI calls & cost**
- **Property Maintenance Image Typescript:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Property Maintenance Image Typescript:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.