import "dotenv/config";
import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ── Serve built React app in production ──────────────────────────────────────
app.use(express.static(path.join(__dirname, "client/dist")));

// ── Anthropic proxy endpoint ─────────────────────────────────────────────────
app.post("/api/parse", async (req, res) => {
  const { transcript } = req.body;

  if (!transcript?.trim()) {
    return res.status(400).json({ error: "No transcript provided." });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not set on server." });
  }

  const systemPrompt = `You are an intake parser for Coleridge Construction, a residential renovation contractor in BC, Canada.
Extract structured project information from a sales call transcript or voice notes.
Return ONLY valid JSON with this exact schema (omit fields you cannot find, use null for unknowns):
{
  "clientName": string,
  "address": string,
  "phone": string,
  "email": string,
  "projectType": string (one of: Bathroom Renovation, Kitchen Renovation, Main Floor Renovation, Basement Suite Addition, Full Home Renovation, Addition, Deck & Outdoor, New Build, Exterior Renovation, Other),
  "homeAge": string (one of: 2000+ (newer), 1980–2000, 1960–1980, Pre-1960, Unknown),
  "budgetRange": string,
  "timeline": string,
  "livingDuringReno": boolean,
  "rooms": [{ "name": string, "sqft": string, "flags": string[], "notes": string }],
  "electricalDays": string,
  "plumbingFixtures": string,
  "plumbingDays": string,
  "tileSF": string,
  "drywall": string,
  "paintSF": string,
  "siteFlags": string[],
  "dumpsterNeeded": boolean,
  "portaPosty": boolean,
  "blackSwans": string,
  "generalNotes": string
}

For rooms[].flags, use values from this list where applicable:
Full demo, Partial demo, New shower, New tub, Tub → shower conversion, Curbless / linear drain, Tile shower, New vanity (custom), New vanity (stock), In-floor heat, Schluter system, New cabinets, New countertop, Island, Pantry, New flooring, Tile floor, New plumbing fixtures, Move plumbing, New electrical / pot lights, Panel upgrade, Structural change / beam, Wall removal, Framing changes, Drywall new, Drywall patch only, New windows, New exterior door, Siding changes, New paint, New trim, Shower glass, Closet shelving

For siteFlags, use values from this list where applicable:
Permits required, Structural engineering likely, Hazmat survey required, Concrete cutting / new drain, Exterior scaffolding, Site access challenges, Client living during reno, Tight site / small lot, Unknown structure / no drawings, Aging electrical (Poly-B / Al wiring), Radon rough-in, High-needs client

Return ONLY the JSON object. No markdown, no explanation.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1500,
        system: systemPrompt,
        messages: [{ role: "user", content: transcript }],
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const text = data.content?.find((b) => b.type === "text")?.text || "{}";
    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    res.json(parsed);
  } catch (err) {
    console.error("Parse error:", err);
    res.status(500).json({ error: "Failed to parse transcript: " + err.message });
  }
});

// ── Catch-all: serve React app for any non-API route ─────────────────────────
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/dist/index.html"));
});

app.listen(PORT, () => {
  console.log(`CC Sales Intake running on port ${PORT}`);
});
