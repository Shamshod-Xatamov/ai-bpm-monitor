import { z } from "zod";
import { requireApiUser } from "@/lib/server/auth/session";
import { toErrorResponse } from "@/lib/server/imports/errors";
import { updateOrganizationUser } from "@/lib/server/users/repository";

const updateUserSchema = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),
    email: z.string().trim().email().max(254).optional(),
    password: z.string().min(8).max(200).optional(),
    role: z.enum(["ADMIN", "ANALYST", "VIEWER"]).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "Kamida bitta maydonni o‘zgartiring.",
  });

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request, context) {
  try {
    const actor = await requireApiUser(request, ["ADMIN"]);
    const { id } = await context.params;
    const payload = updateUserSchema.parse(await request.json());
    return Response.json(
      await updateOrganizationUser({
        organizationId: actor.orgId,
        actorId: actor.id,
        userId: id,
        payload,
      }),
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}
