"use client";

import { useCallback, useMemo, useState } from "react";

type VideoJob = {
  id: string;
  prompt: string;
  status: "idle" | "processing" | "succeeded" | "failed";
  createdAt: number;
  videoUrl?: string;
  thumbnailUrl?: string;
  transcript?: string;
  error?: string;
  requestSummary: string;
};

type GenerateResponse = {
  videoUrl?: string;
  thumbnailUrl?: string;
  transcript?: string;
  requestId?: string;
};

const DEFAULT_PROMPT =
  "Slow cinematic aerial shot over a futuristic coastal megacity at golden hour, volumetric lighting, ultra realistic details";

const DURATION_OPTIONS = [
  { label: "6 seconds", value: 6 },
  { label: "8 seconds", value: 8 },
  { label: "10 seconds", value: 10 },
  { label: "12 seconds", value: 12 },
];

const ASPECT_OPTIONS = [
  { label: "16:9 (Landscape)", value: "16:9" },
  { label: "9:16 (Portrait)", value: "9:16" },
  { label: "1:1 (Square)", value: "1:1" },
  { label: "2.39:1 (Cinematic)", value: "2.39:1" },
];

const STYLE_PRESETS = [
  { label: "Cinematic Ultra-Real", value: "CINEMATIC_ULTRA_REAL" },
  { label: "Documentary", value: "DOCUMENTARY" },
  { label: "Stylized Film", value: "STYLIZED_FILM" },
  { label: "Hyper Real 8K", value: "HYPER_REAL_8K" },
  { label: "Dreamlike", value: "DREAMLIKE" },
];

const CREATIVE_MODES = [
  { label: "Balanced", value: "CREATIVE_BALANCED" },
  { label: "Creative", value: "CREATIVE" },
  { label: "Literal", value: "PRECISE" },
];

export default function Home() {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [negativePrompt, setNegativePrompt] = useState(
    "Avoid low resolution, jitter, or unrealistic motion"
  );
  const [duration, setDuration] = useState<number>(8);
  const [aspectRatio, setAspectRatio] = useState<string>("16:9");
  const [stylePreset, setStylePreset] = useState<string>("CINEMATIC_ULTRA_REAL");
  const [creativeMode, setCreativeMode] = useState<string>("CREATIVE_BALANCED");
  const [guidanceScale, setGuidanceScale] = useState<number>(0.5);
  const [seed, setSeed] = useState<number | undefined>();
  const [isSubmitting, setSubmitting] = useState(false);
  const [activeJob, setActiveJob] = useState<VideoJob | null>(null);
  const [history, setHistory] = useState<VideoJob[]>([]);

  const requestSummary = useMemo(() => {
    const parts = [stylePreset.replaceAll("_", " "), aspectRatio, `${duration}s`];
    if (creativeMode !== "CREATIVE_BALANCED") parts.push(creativeMode);
    return parts.join(" • ");
  }, [stylePreset, aspectRatio, duration, creativeMode]);

  const resetJob = useCallback(() => {
    setActiveJob(null);
    setSubmitting(false);
  }, []);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!prompt?.trim()) {
        return;
      }

      setSubmitting(true);
      const jobId = crypto.randomUUID();
      const job: VideoJob = {
        id: jobId,
        prompt,
        status: "processing",
        createdAt: Date.now(),
        requestSummary,
      };
      setActiveJob(job);

      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt,
            negativePrompt,
            duration,
            aspectRatio,
            stylePreset,
            creativeMode,
            guidanceScale,
            seed,
          }),
        });

        if (!response.ok) {
          const details = await response.json().catch(() => ({}));
          throw new Error(details.error ?? "Unable to generate video");
        }

        const payload: GenerateResponse = await response.json();
        const nextJob: VideoJob = {
          ...job,
          status: "succeeded",
          videoUrl: payload.videoUrl,
          thumbnailUrl: payload.thumbnailUrl,
          transcript: payload.transcript,
        };
        setActiveJob(nextJob);
        setHistory((prev) => [nextJob, ...prev]);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unexpected error";
        const failureJob: VideoJob = {
          ...job,
          status: "failed",
          error: message,
        };
        setActiveJob(failureJob);
        setHistory((prev) => [failureJob, ...prev]);
      } finally {
        setSubmitting(false);
      }
    },
    [
      prompt,
      negativePrompt,
      duration,
      aspectRatio,
      stylePreset,
      creativeMode,
      guidanceScale,
      seed,
      requestSummary,
    ]
  );

  const visibleHistory = history.filter((item) => item.id !== activeJob?.id);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.25),transparent_60%),radial-gradient(circle_at_80%_0%,rgba(236,72,153,0.2),transparent_55%),radial-gradient(circle_at_50%_80%,rgba(34,197,94,0.3),transparent_60%)]" />
      <main className="mx-auto flex max-w-6xl flex-col gap-12 px-6 pb-24 pt-24">
        <section className="flex flex-col gap-6">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-sm font-medium uppercase tracking-wider text-white/80">
            Veo 3.1 Ultra 8K
          </span>
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
            AI video director for heroic 8K cinematic storytelling.
          </h1>
          <p className="max-w-2xl text-lg text-slate-200/80">
            Describe the scene, set the mood, and let Google Veo 3.1 craft stunning ultra-realistic footage ready for trailers, commercials, and storytelling at 8K resolution.
          </p>
        </section>

        <section className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-8 backdrop-blur"
          >
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-white/80">
                Cinematic prompt
              </label>
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                rows={5}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-base text-white placeholder:text-white/40 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                placeholder="Describe your cinematic scene in vivid detail"
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-white/80">
                  Negative prompt
                </label>
                <textarea
                  value={negativePrompt}
                  onChange={(event) => setNegativePrompt(event.target.value)}
                  rows={3}
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-base text-white placeholder:text-white/40 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                  placeholder="Elements to exclude"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-white/80">
                  Duration
                </label>
                <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3">
                  <select
                    value={duration}
                    onChange={(event) => setDuration(Number(event.target.value))}
                    className="w-full bg-transparent text-base text-white focus:outline-none"
                  >
                    {DURATION_OPTIONS.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        className="bg-slate-900 text-white"
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-white/80">
                  Aspect ratio
                </label>
                <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3">
                  <select
                    value={aspectRatio}
                    onChange={(event) => setAspectRatio(event.target.value)}
                    className="w-full bg-transparent text-base text-white focus:outline-none"
                  >
                    {ASPECT_OPTIONS.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        className="bg-slate-900 text-white"
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-white/80">
                  Style preset
                </label>
                <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3">
                  <select
                    value={stylePreset}
                    onChange={(event) => setStylePreset(event.target.value)}
                    className="w-full bg-transparent text-base text-white focus:outline-none"
                  >
                    {STYLE_PRESETS.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        className="bg-slate-900 text-white"
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/40 px-4 py-3">
                <div className="flex items-center justify-between text-sm font-medium text-white/80">
                  <span>Visual guidance</span>
                  <span className="text-xs text-white/50">{Math.round(guidanceScale * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={guidanceScale}
                  onChange={(event) => setGuidanceScale(Number(event.target.value))}
                  className="w-full accent-sky-500"
                />
                <p className="text-xs text-white/60">
                  Increase to keep closer to your prompt, decrease for more discoverable ideas.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-white/80">
                  Creative mode
                </label>
                <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3">
                  <select
                    value={creativeMode}
                    onChange={(event) => setCreativeMode(event.target.value)}
                    className="w-full bg-transparent text-base text-white focus:outline-none"
                  >
                    {CREATIVE_MODES.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        className="bg-slate-900 text-white"
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-white/80">
                  Seed (optional)
                </label>
                <input
                  value={seed ?? ""}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (!value) {
                      setSeed(undefined);
                      return;
                    }
                    const next = Number(value);
                    if (!Number.isNaN(next)) {
                      setSeed(next);
                    }
                  }}
                  placeholder="Randomized"
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-base text-white placeholder:text-white/40 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="group flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-sky-500 via-purple-500 to-rose-500 px-6 py-3 text-lg font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:shadow-rose-500/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Directing sequence…" : "Generate 8K video"}
              <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-medium tracking-wide">
                {requestSummary}
              </span>
            </button>
          </form>

          <aside className="flex flex-col gap-6">
            <div className="min-h-[340px] rounded-3xl border border-white/10 bg-black/50 p-6">
              <header className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Latest render</h2>
                {activeJob?.createdAt && (
                  <time className="text-xs text-white/40">
                    {new Date(activeJob.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                )}
              </header>

              {!activeJob && (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center text-white/60">
                  <div className="h-24 w-24 rounded-full border border-dashed border-white/20" />
                  <p className="max-w-xs text-sm">
                    Generate a video to see Veo 3.1 output in cinematic fidelity.
                  </p>
                </div>
              )}

              {activeJob?.status === "processing" && (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center text-white/80">
                  <div className="relative h-24 w-24">
                    <div className="absolute inset-0 animate-spin rounded-full border-4 border-white/10 border-t-sky-400" />
                    <div className="absolute inset-4 rounded-full border border-white/10" />
                  </div>
                  <p className="text-sm uppercase tracking-[0.2em] text-white/60">
                    Rendering 8K frames
                  </p>
                </div>
              )}

              {activeJob?.status === "failed" && (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-rose-300">
                  <p className="text-base font-medium">Generation failed</p>
                  <p className="max-w-xs text-xs text-white/60">
                    {activeJob.error ?? "Unknown error. Please tweak your prompt and retry."}
                  </p>
                  <button
                    className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-wide text-white/70 hover:border-white/40"
                    onClick={resetJob}
                  >
                    Reset
                  </button>
                </div>
              )}

              {activeJob?.status === "succeeded" && (
                <div className="flex flex-col gap-4">
                  {activeJob.videoUrl ? (
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/60">
                      <video
                        controls
                        preload="metadata"
                        className="w-full"
                        poster={activeJob.thumbnailUrl}
                      >
                        <source src={activeJob.videoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  ) : (
                    <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-white/20 bg-black/40 text-sm text-white/60">
                      Awaiting Veo stream URL...
                    </div>
                  )}
                  {activeJob.transcript && (
                    <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-white/70">
                      <p className="font-medium text-white">AI Shot Notes</p>
                      <p className="mt-2 whitespace-pre-wrap text-xs text-white/60">
                        {activeJob.transcript}
                      </p>
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-white/60">
                    <span className="rounded-full border border-white/10 px-3 py-1 uppercase tracking-wide">
                      {activeJob.requestSummary}
                    </span>
                    <span className="rounded-full border border-white/10 px-3 py-1 uppercase tracking-wide">
                      Seed {seed ?? "random"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/40 p-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">
                Render history
              </h3>
              <div className="mt-4 flex flex-col gap-4">
                {visibleHistory.length === 0 && (
                  <p className="text-xs text-white/50">
                    Each generation will be logged here with playback references.
                  </p>
                )}
                {visibleHistory.map((entry) => (
                  <article
                    key={entry.id}
                    className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-col">
                        <p className="text-sm font-medium text-white/80">
                          {entry.prompt}
                        </p>
                        <p className="text-xs uppercase tracking-wide text-white/40">
                          {entry.requestSummary}
                        </p>
                      </div>
                      <span className="text-xs text-white/50">
                        {new Date(entry.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <span className="rounded-full border border-white/10 px-3 py-1 text-white/60">
                        {entry.status === "succeeded" ? "Ready" : entry.status}
                      </span>
                      {entry.videoUrl && (
                        <a
                          href={entry.videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full border border-sky-400/40 px-3 py-1 text-sky-300 transition hover:border-sky-300 hover:text-sky-200"
                        >
                          Watch render
                        </a>
                      )}
                      {entry.error && (
                        <span className="rounded-full border border-rose-400/40 px-3 py-1 text-rose-200">
                          {entry.error}
                        </span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
