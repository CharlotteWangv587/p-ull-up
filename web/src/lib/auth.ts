import { NextRequest } from "next/server";
import { supabaseAuthed } from "@/lib/supabase";

export class UnauthorizedError extends Error {
  status: number;

  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
    this.status = 401;
  }
}

function readBearerToken(request: NextRequest): string {
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    throw new UnauthorizedError("Missing Authorization header");
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new UnauthorizedError("Invalid Authorization header format");
  }

  return token.trim();
}

export async function requireUser(request: NextRequest): Promise<string> {
  const token = readBearerToken(request);
  const supabase = supabaseAuthed(token);

  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    throw new UnauthorizedError("Invalid or expired token");
  }

  return data.user.id;
}