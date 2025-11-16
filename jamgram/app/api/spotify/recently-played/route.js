import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  const token = session?.accessToken;

  if (!token) return Response.json({ error: "No access token" }, { status: 401 });

  const res = await fetch("https://api.spotify.com/v1/me/player/recently-played?limit=20", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return Response.json(await res.json());
}