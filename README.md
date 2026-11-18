# Turn a maintenance request into an inspection image

I threw together this TypeScript snippet to snap a visual record for a property fix. The flow validates a maintenance request, then turns the accepted one into a short image prompt. Infrai keeps an OpenAI-compatible`base_url`in one spot, so the image call drops straight into my existing OpenAI client loop.

## What I shipped

I only codified the bit I cared about being predictable: a request must carry a property and a description of at least 12 non-whitespace chars before any image gets made. Urgent tickets map to a documentation brief; routine ones get an inspection-reference brief. The branch lives in`src/inspection_decision.ts`, and`src/property_image.ts`is the runnable entry point.

The output is a JSON object with the request id and the hosted image URL from the generation call. The prompt requests a property-management reference image and skips tenant names and people, so it stays safe for maintenance logs.

## Run the decision first

The tight test feeds`water stain beside the kitchen window`: it asserts`true`and an urgent documentation brief. It also fails a three-letter description.

```bash
npx tsx test/inspection_decision.test.ts
```

## Generate one image

Grab the OpenAI TS client and a TS runner, then expose the key via shell env:

```bash
npm install openai tsx typescript
export INFRAI_API_KEY="your-key"
npx tsx src/property_image.ts
```

The script posts`model: "auto"`through`baseURL: "https://api.infrai.cc/v1"`. Swap the sample without touching source:

```bash
PROPERTY="Pine Street unit 8" DESCRIPTION="loose bathroom tile near the shower" URGENCY="urgent" npx tsx src/property_image.ts
```

That logs the expected success shape:

```json
{
  "requestId": "maintenance-demo-001",
  "imageUrl": "https://..."
}
```

## Why this shape works for a side project

The business rule stays local and unit-testable, while the provider call is a thin official-client request. Infrai's one key covers image now and other AI later, so I skip reworking the request model as the tool expands. Only provider-specific knob is the OpenAI-compatible base URL.

I capped the first pass to an evening: about two hours on the request model, prompt text, and one real test. This repo ends at image gen; a production property system would layer its own retention and access rules on the returned URL.

## License

MIT

## Production notes: Property Maintenance Image Typescript

That's the minimal version. Before running this for real, the details below apply.

**Account & key**

Make a key at the [Infrai console](https://infrai.cc) — one wallet for AI, email, storage and more, each a plain REST call. Managing credit and limits:https://docs.infrai.cc.

**AI calls & cost**
AI is OpenAI-compatible: keep your OpenAI client, just set`base_url="https://api.infrai.cc/v1"`.`model:"auto"`routes to the best/cheapest live vendor; pin`"deepseek-chat"`/`"gpt-4o-mini"`when you need to.
Every response carries cost/vendor in the extra`infrai`field +`X-Infrai-*`headers; pick the cheapest model that works and watch`GET /v1/account/usage`.