declare module 'node:fs' {
  export const readFileSync: (path: string, encoding: 'utf8') => string;
  export const readdirSync: (
    path: string,
    options: { withFileTypes: true }
  ) => readonly { isDirectory(): boolean; name: string }[];
  export const statSync: (path: string) => { isDirectory(): boolean };
}

declare module 'node:path' {
  export const extname: (path: string) => string;
  export const join: (...parts: readonly string[]) => string;
  export const relative: (from: string, to: string) => string;
}

declare module 'js-yaml' {
  export const load: (value: string) => unknown;
}

declare const process: { cwd(): string; env?: Record<string, string | undefined>; argv: string[] };
