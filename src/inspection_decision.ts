export type MaintenanceRequest = {
  requestId: string;
  property: string;
  description: string;
  urgency: "routine" | "urgent";
};

export function imageBriefFor(request: MaintenanceRequest): string {
  const prefix = request.urgency === "urgent" ? "Document the active repair clearly" : "Create a tidy inspection reference";
  return `${prefix} for ${request.property}: ${request.description}. No people, no tenant names, realistic property-management documentation.`;
}

export function shouldGenerateImage(request: MaintenanceRequest): boolean {
  return request.description.trim().length >= 12 && request.property.trim().length > 0;
}
