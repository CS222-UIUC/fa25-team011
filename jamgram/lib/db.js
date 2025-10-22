import { sql } from '@vercel/postgres';

// EXAMPLE: databases not fully set up yet at all but if we want to insert new user
export async function createUser({ name, email, spotifyId }) {
  const { rows } = await sql`
    INSERT INTO users (name, email, spotify_id)
    VALUES (${name}, ${email}, ${spotifyId})
    RETURNING *;
  `;
  return rows[0];
}