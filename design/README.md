# Design references

Drop Figma Make / design exports here so the agent can build from them.

## Best place for Figma Make

Put the **exported Make project or zip contents** in:

```
design/figma-make/
```

That can include:

- Exported React / HTML / CSS from Figma Make
- Screenshots of screens
- Any `README` or notes from Make
- Component or token exports

## Other useful drops

| What you have | Where to put it |
|---|---|
| Screen PNGs / JPGs | `design/` or `design/screens/` |
| Icons / logos for the live site | `public/assets/` |
| Figma file link | Paste the link in chat (or connect TalkToFigma) |

## Tip

If Figma Make gave you a full app folder (with its own `src/`, `package.json`, etc.), unzip it into `design/figma-make/` first. Tell me it’s there and I’ll merge the useful parts into this Vite React app for Vercel.
