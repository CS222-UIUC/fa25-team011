import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  const token = session?.accessToken;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { objects, instruction } = await req.json();

  if (!objects || !Array.isArray(objects)) {
    return NextResponse.json(
      { error: "Objects array required" },
      { status: 400 }
    );
  }

  try {
    // fetch user's recently played songs
    console.log("Fetching recently played songs...");
    const recentlyPlayedRes = await fetch(
      "https://api.spotify.com/v1/me/player/recently-played?limit=20",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const recentlyPlayedData = await recentlyPlayedRes.json();
    const recentlyPlayedSongs = recentlyPlayedData.items
      ?.slice(0, 20)
      .map((item) => `${item.track.name} by ${item.track.artists[0]?.name}`)
      .join("\n");

    console.log("Recently played songs:", recentlyPlayedSongs);

    // fetch user's top artists
    console.log("Fetching top artists...");
    const topArtistsRes = await fetch(
      "https://api.spotify.com/v1/me/top/artists?limit=20",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const topArtistsData = await topArtistsRes.json();
    const topArtists = topArtistsData.items
      ?.slice(0, 20)
      .map((artist) => artist.name)
      .join(", ");

    console.log("Top artists:", topArtists);

    // system prompt for grok LLM
    const systemPrompt = `You are an expert music curator and vibe interpreter specializing in short-form social media content (Instagram Stories).

    Your task is to recommend EXACTLY 10 songs that best match the mood of an image and the listener's music taste.

    You are given:
    1) Noisy object detection results from an image (may be incomplete, vague, or partially incorrect)
    2) A list of the user's recently played songs
    3) A list of the user's top artists

    Your goal is NOT literal object-to-song matching.
    Your goal is to infer the *vibe, emotion, and social context* of the image and blend it with the user's listening habits.

    ━━━━━━━━━━━━━━━━━━━━━━
    INTERPRETATION RULES
    ━━━━━━━━━━━━━━━━━━━━━━

    IMAGE UNDERSTANDING:
    • Treat detected objects as *hints*, not facts
    • Focus on inferred:
    - Mood (e.g. chill, hype, nostalgic, dreamy, chaotic, romantic)
    - Setting (e.g. night out, sunset, indoors, travel, party, quiet moment)
    - Energy level (low / medium / high)
    • If objects conflict or seem random, prioritize:
    - Common Instagram aesthetics
    - Emotional coherence over realism

    MUSIC TASTE MODELING:
    • Recently played songs indicate *current mood*
    • Top artists indicate *long-term identity*
    • Favor artists/genres adjacent to the user's taste
    • Avoid recommending songs the user has recently played unless they are iconic fits

    RECOMMENDATION CONSTRAINTS:
    • Recommend EXACTLY 10 songs
    • Songs should be:
    - Recognizable within the first 10–15 seconds
    - Suitable for Instagram stories
    - Cohesive as a set (not random genre jumps)
    • Mix:
    - Familiar artists
    - Taste-adjacent discoveries
    • Do NOT include explanations unless explicitly asked

    ━━━━━━━━━━━━━━━━━━━━━━
    OUTPUT FORMAT
    ━━━━━━━━━━━━━━━━━━━━━━

    Return only the following:

    Mood: <1 short phrase describing the overall vibe>

    1. Song Title – Artist
    2. Song Title – Artist
    3. Song Title – Artist
    4. Song Title – Artist
    5. Song Title – Artist
    6. Song Title – Artist
    7. Song Title – Artist
    8. Song Title – Artist
    9. Song Title – Artist
    10. Song Title – Artist

    ━━━━━━━━━━━━━━━━━━━━━━
    QUALITY BAR
    ━━━━━━━━━━━━━━━━━━━━━━

    The list should feel:
    • Curated, not algorithmic
    • Social-media aware
    • Emotionally intentional
    • "I'd post this" level good

    If the image mood and music taste conflict, prioritize *vibe harmony* over strict preference matching.`;

        let userPrompt = `Image objects detected: ${objects.join(", ")}

    Recently played songs:
    ${recentlyPlayedSongs}

    Top artists:
    ${topArtists}

    Based on this image vibe and music taste, recommend exactly 10 songs.`;

    if (instruction && typeof instruction === "string" && instruction.trim().length > 0) {
      userPrompt += `\n\nUser instruction: ${instruction}`;
    }

    // call grok LLM for recommendations
    console.log("Calling Groq LLM for recommendations...");

    if (!process.env.GROK_KEY) {
      console.error("GROK_KEY environment variable is not set");
      return NextResponse.json({ error: "Grok API key not configured" }, { status: 500 });
    }

    const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
    const grokModel = process.env.GROK_MODEL || "llama-3.1-8b-instant";

    const grokPayload = {
      model: grokModel,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 700,
      temperature: 0.7,
      top_p: 0.9,
    };

    const grokRes = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROK_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(grokPayload),
    });

    console.log("Grok response status:", grokRes.status);

    if (!grokRes.ok) {
      const errorText = await grokRes.text();
      console.error("Grok error:", grokRes.status, errorText);
      return NextResponse.json({ error: `Grok LLM failed: ${errorText}` }, { status: grokRes.status });
    }

    const grokData = await grokRes.json();
    console.log("Grok response:", JSON.stringify(grokData).substring(0, 500));

    let recommendations = "";
    if (grokData.choices && grokData.choices[0]) {
      recommendations = grokData.choices[0].message?.content ?? grokData.choices[0].text ?? "";
    } else if (grokData.choices && grokData.choices.length === 0 && grokData.output) {
      recommendations = Array.isArray(grokData.output) ? grokData.output.map(o => o.content).join("\n") : grokData.output;
    } else if (typeof grokData === "string") {
      recommendations = grokData;
    }

    console.log("Final recommendations:", recommendations);

    return NextResponse.json({
      recommendations,
      recentlyPlayed: recentlyPlayedSongs,
      topArtists,
    });
  } catch (error) {
    console.error("Recommendation generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}
