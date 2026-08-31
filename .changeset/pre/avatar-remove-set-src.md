---
"@zag-js/avatar": major
---

**Breaking:** Remove `api.setSrc`.

You own the image `src`, the machine observes the rendered image and owns its loading lifecycle. `setSrc` wrote the
`src` attribute of the image you rendered, making it the only API method in the library that mutates a consumer-rendered
element. It also left `srcSet` and `<picture>` untouched, so the displayed image did not always change.

### Migration

**Setting the source:** update `src` on the image you render. The machine reacts the same way, resetting to `loading`
and then to `loaded` or `error`.

```diff
- api.setSrc(nextSrc)
+ setSrc(nextSrc) // your own state, applied to the image you render
```

```tsx
const [src, setSrc] = useState(initialSrc)

<img alt="" src={src} {...api.getImageProps()} />
```

**Without framework state,** set it on the element directly. This is what `setSrc` did, and it works for `srcSet` and
`<picture>` too:

```diff
- api.setSrc(nextSrc)
+ imageEl.src = nextSrc
```

**Unchanged:** `api.setLoaded()` and `api.setError()`, for images loaded by something that does not fire `load` and
`error` on the element itself.
