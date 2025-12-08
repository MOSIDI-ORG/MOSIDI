/// <reference path="../../frontend/public/landing-page/.astro/types.d.ts" />
/// <reference path="../../frontend/dist/landing-page/.astro/types.d.ts" />
/// <reference path="../.astro/types.d.ts" />
declare module '*.vtt?url' {
  const src: string;
  export default src;
}