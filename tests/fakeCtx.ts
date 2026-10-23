export interface CtxCall {
  name: string;
  args: unknown[];
}

export function createFakeCtx() {
  const calls: CtxCall[] = [];
  const props: Record<string, unknown> = {};
  const ctx = new Proxy(
    {},
    {
      get(_t, p: string) {
        if (p in props) return props[p];
        return (...args: unknown[]) => {
          calls.push({ name: p, args });

          if (p === "createLinearGradient") return { addColorStop: () => {} };
          return undefined;
        };
      },
      set(_t, p: string, v: unknown) {
        props[p] = v;
        calls.push({ name: `set:${p}`, args: [v] });
        return true;
      },
    },
  ) as unknown as CanvasRenderingContext2D;

  const named = (name: string) => calls.filter((c) => c.name === name);
  const texts = () => named("fillText").map((c) => String(c.args[0]));
  return { ctx, calls, props, named, texts };
}

export function seededRng(seed = 1): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}
