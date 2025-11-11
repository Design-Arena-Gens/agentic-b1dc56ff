import { NextResponse } from "next/server";
import { z } from "zod";

import { generateVeoVideo } from "@/lib/google-veo";

const payloadSchema = z.object({
  prompt: z.string().min(8, "Prompt must contain at least 8 characters"),
  negativePrompt: z.string().max(600).optional().or(z.literal("")),
  duration: z.number().int().min(4).max(16).default(8),
  aspectRatio: z
    .string()
    .regex(/^(16:9|9:16|1:1|2.39:1)$/)
    .optional(),
  stylePreset: z.string().optional(),
  creativeMode: z.string().optional(),
  guidanceScale: z.number().min(0).max(1).optional(),
  seed: z.number().int().nonnegative().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parseNumber = (value: unknown): number | undefined => {
      if (typeof value === "number" && Number.isFinite(value)) return value;
      if (typeof value === "string" && value.trim().length > 0) {
        const coerced = Number(value);
        return Number.isFinite(coerced) ? coerced : undefined;
      }
      return undefined;
    };

    const input = payloadSchema.parse({
      ...body,
      duration: parseNumber(body?.duration),
      guidanceScale: parseNumber(body?.guidanceScale),
      seed: parseNumber(body?.seed),
    });

    const result = await generateVeoVideo({
      prompt: input.prompt,
      negativePrompt:
        typeof input.negativePrompt === "string" && input.negativePrompt.trim().length > 0
          ? input.negativePrompt
          : undefined,
      duration: input.duration,
      aspectRatio: input.aspectRatio,
      stylePreset: input.stylePreset,
      creativeMode: input.creativeMode,
      guidanceScale: input.guidanceScale,
      seed: input.seed,
    });

    return NextResponse.json(
      {
        ...result,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues.map((issue) => issue.message).join(". ") },
        { status: 400 }
      );
    }

    const message =
      error instanceof Error ? error.message : "Unexpected error while generating video";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
