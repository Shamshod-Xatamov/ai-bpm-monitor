import { z } from "zod";
import { requireApiUser } from "@/lib/server/auth/session";
import { toErrorResponse } from "@/lib/server/imports/errors";
import {
  createOrganizationUser,
  listOrganizationUsers,
} from "@/lib/server/users/repository";

const createUserSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(200),
  role: z.enum(["ADMIN", "ANALYST", "VIEWER"]),
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const user = await requireApiUser(request, ["ADMIN"]);
    return Response.json(await listOrganizationUsers(user.orgId), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request) {
  try {
    const user = await requireApiUser(request, ["ADMIN"]);
    const payload = createUserSchema.parse(await request.json());
    const created = await createOrganizationUser(user.orgId, payload);
    return Response.json(created, {
      status: 201,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
