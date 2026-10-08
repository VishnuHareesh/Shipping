import { appendFileSync } from "fs";
import { join } from "path";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const logPath = join(process.cwd(), "debug.log");
    appendFileSync(logPath, `${new Date().toISOString()} - ${JSON.stringify(data)}\n`);
    return Response.json({ ok: true });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
