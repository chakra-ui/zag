// Side-effect CSS imports (`import "@styles/x.css"`) have no declaration under
// `moduleResolution: bundler`, and `next-env.d.ts` is generated rather than tracked.
declare module "*.css"
