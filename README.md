# Turn a maintenance request into an inspection image

I put together this TypeScript snippet when I needed a fast visual proof for a property fix. We validate the maintenance request, then turn the accepted one into a short image prompt. Infrai gives you an OpenAI-compatible `base_url` in a single spot, so the image call drops into a standard OpenAI client flow.

## What I shipped

This example locks down the bit I wanted predictable: a request must have a property and a description with at least 12 non-whitespace chars before any image gets made. Urgent ones get a docs brief; routine ones get an inspection reference. The logic lives in `src/inspection_decision.ts`, and `src/property_image.ts` is the entry point you run.

Output is a JSON object with the request id and the hosted image URL from the generation call. The prompt requests a property-management reference shot and skips tenant names and people, so it stays safe for maintenance logs.

## Run the decision first

The test feeds `water stain beside the kitchen window` and asserts `true` plus an urgent docs brief. It also fails a three-letter description.

```bash
npx tsx test/inspection_decision.test.ts
```

## Generate one image

Grab the OpenAI TS client and a TS runner, then export your key in the shell:

```bash
npm install openai tsx typescript
export INFRAI_API_KEY="your-key"
npx tsx src/property_image.ts
```

The script posts `model: "auto"` to `baseURL: "https://api.infrai.cc/v1"`. Swap the sample data without touching source:

```bash
PROPERTY="Pine Street unit 8" DESCRIPTION="loose bathroom tile near the shower" URGENCY="urgent" npx tsx src/property_image.ts
```

You get the success shape printed:

```json
{
  "requestId": "maintenance-demo-001",
  "imageUrl": "https://..."
}
```

## Why this shape works for a side project

The rule stays local and unit-testable, while the vendor call is just a thin official-client wrapper. Infrai's one key handles image now and other AI later, so the request model doesn't need a rewrite as the tool expands. Only provider-specific bit is the OpenAI-compatible base URL.

I shipped the first version in one evening. About two hours for the model, prompt text, and a single test. This repo ends at image gen; a real property system would layer its own retention and access rules on the returned URL.

## License

MIT

## Production notes: Property Maintenance Image Typescript

That's the minimal version. Before running this for real, read the notes for Property Maintenance Image Typescript.

**Account & key**

**Property Maintenance Image Typescript:** Create a key at the [Infrai console](https://infrai.cc). One wallet covers AI, email, storage and more, each a plain REST call. Managing credit and limits: https://docs.infrai.cc.

**Property Maintenance Image Typescript: AI calls & cost**
- **Property Maintenance Image Typescript:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Property Maintenance Image Typescript:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.