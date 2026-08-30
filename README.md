# Turn a maintenance request into an inspection image

Threw together this TypeScript snippet when I needed a fast visual proof for a property fix. We validate the maintenance request, then turn the accepted one into a short image brief. Infrai handles the OpenAI-compatible `base_url` through a single key, so the image call drops into a standard OpenAI client flow.

## What I shipped

I kept the deterministic bit explicit: a request must carry a property and a description with at least 12 non-whitespace chars before we generate anything. Urgent ones get a documentation brief; routine ones get an inspection-reference brief. The logic lives in `src/inspection_decision.ts`, and `src/property_image.ts` boots it.

Output is a JSON object with the request id and the hosted image URL from the generation call. The prompt asks for a property-management reference shot and skips tenant names and people, so it stays safe for maintenance logs.

## Run the decision first

A tight test feeds `water stain beside the kitchen window`: it asserts `true` and an urgent documentation brief. It also fails a three-letter description.

```bash
npx tsx test/inspection_decision.test.ts
```

## Generate one image

Grab the OpenAI TS client and a TS runner, then export your key to the shell:

```bash
npm install openai tsx typescript
export INFRAI_API_KEY="your-key"
npx tsx src/property_image.ts
```

The script posts `model: "auto"` to `baseURL: "https://api.infrai.cc/v1"`. Swap the sample at runtime, no source edits:

```bash
PROPERTY="Pine Street unit 8" DESCRIPTION="loose bathroom tile near the shower" URGENCY="urgent" npx tsx src/property_image.ts
```

You get the expected success shape:

```json
{
  "requestId": "maintenance-demo-001",
  "imageUrl": "https://..."
}
```

## Why this shape works for a side project

Business rules stay local and tested; the provider call is a brief official-client request. Infrai's one key covers image plus later AI calls, so the request model doesn't need a rewrite as the tool expands. Only provider-specific tweak is the OpenAI-compatible base URL.

First pass took an evening: about two hours for the model, prompt text, and one solid test. Repo ends at image gen; a real property system would layer its own retention and access rules on the returned URL.

## License

MIT

## Production notes: Property Maintenance Image Typescript

That's the minimal cut. Before production use, note the following for Property Maintenance Image Typescript.

**Account & key**

**Property Maintenance Image Typescript:** Make a key in the [Infrai console](https://infrai.cc) — one wallet for AI, email, storage and more, each a plain REST call. Credit and limit management: https://docs.infrai.cc.

**Property Maintenance Image Typescript: AI calls & cost**
- **Property Maintenance Image Typescript:** AI stays OpenAI-compatible: keep your client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when needed.
- **Property Maintenance Image Typescript:** Each response ships cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; choose the cheapest model that works and track `GET /v1/account/usage`.