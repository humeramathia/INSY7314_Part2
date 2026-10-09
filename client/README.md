# HustleHub+ client

React UI for Part 2. Design lives here; Lilitha wires the API.

```bash
cd client
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). Props are listed in `DESIGN.md`.

The API must already be running on `https://localhost:3000`. Accept the browser warning for the local HTTPS certificate once, or login from the website will fail.

```bash
npm test
```

That runs the Vitest suite (rendering and user interaction) without calling the live API.
