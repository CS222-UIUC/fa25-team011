import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import OpenAI from "openai";

export async function GET(req) {
  // get curr session from nextauth
  const session = await getServerSession(authOptions);

  if (!session) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const token = session.accessToken;

  if (!token) {
    return Response.json({ error: "Missing Spotify access token" }, { status: 401 });
  }

  // get spotify data
  const [artistsRes, recentRes] = await Promise.all([
    fetch("https://api.spotify.com/v1/me/top/artists?limit=20", {
      headers: { Authorization: `Bearer ${token}` },
    }),
    fetch("https://api.spotify.com/v1/me/player/recently-played?limit=20", {
      headers: { Authorization: `Bearer ${token}` },
    }),
  ]);

  const [artists, recent] = await Promise.all([
    artistsRes.json(),
    recentRes.json(),
  ]);

  // send data to LLM
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // send image data -- update this based on image stuff
  const { imageBase64 } = await req.json();
  const imageFeatures = await callImageLLM(imageBase64); // change callImageLLM

  // prompt to llm
  const prompt = `
    USER’S SPOTIFY PROFILE:
    - top artists: ${JSON.stringify(artists.map(a => a.name))}
    - recently played: ${JSON.stringify(recent.map(r => r.track.name))}

    IMAGE FEATURES:
    ${JSON.stringify(imageFeatures, null, 2)}

    TASK:
    Recommend 5 songs matching both the Spotify taste and image vibe.
    explain each song’s vibe in 1 sentence.
    `;

  // send prompt to OpenAI
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const completion = await openai.chat.completions.create({
    model: "gpt-4.1",
    messages: [
      { role: "system", content: "You recommend songs based on image vibes + Spotify taste." },
      { role: "user", content: prompt },
    ],
  });

  // return LLM result
  return Response.json({
    recommendations: completion.choices[0].message.content,
    rawSpotify: { artists, recent },
    imageFeatures,
  });
}