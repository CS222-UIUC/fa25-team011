import { sql } from '@vercel/postgres';

// USER MANAGEMENT

export async function createOrUpdateUser({ name, email, spotifyId }) {
  const { rows } = await sql`
    INSERT INTO users (name, email, spotify_id, created_at, updated_at)
    VALUES (${name}, ${email}, ${spotifyId}, NOW(), NOW())
    ON CONFLICT (spotify_id) DO UPDATE
    SET name = ${name}, email = ${email}, updated_at = NOW()
    RETURNING *;
  `;
  return rows[0];
}

export async function getUserBySpotifyId(spotifyId) {
  const { rows } = await sql`
    SELECT * FROM users WHERE spotify_id = ${spotifyId};
  `;
  return rows[0];
}

export async function getUserById(userId) {
  const { rows } = await sql`
    SELECT * FROM users WHERE id = ${userId};
  `;
  return rows[0];
}

// SPOTIFY DATA

export async function saveTopArtists({ userId, artists }) {
  const { rows } = await sql`
    INSERT INTO spotify_top_artists (user_id, artists, updated_at)
    VALUES (${userId}, ${JSON.stringify(artists)}, NOW())
    ON CONFLICT (user_id) DO UPDATE
    SET artists = ${JSON.stringify(artists)}, updated_at = NOW()
    RETURNING *;
  `;
  return rows[0];
}

export async function saveRecentTracks({ userId, tracks }) {
  const { rows } = await sql`
    INSERT INTO spotify_recent_tracks (user_id, tracks, updated_at)
    VALUES (${userId}, ${JSON.stringify(tracks)}, NOW())
    ON CONFLICT (user_id) DO UPDATE
    SET tracks = ${JSON.stringify(tracks)}, updated_at = NOW()
    RETURNING *;
  `;
  return rows[0];
}

export async function getTopArtists(userId) {
  const { rows } = await sql`
    SELECT * FROM spotify_top_artists WHERE user_id = ${userId};
  `;
  return rows[0];
}

export async function getRecentTracks(userId) {
  const { rows } = await sql`
    SELECT * FROM spotify_recent_tracks WHERE user_id = ${userId};
  `;
  return rows[0];
}

// DATABASE INITIALIZATION

export async function initializeDatabase() {
  // Create users table
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255),
      email VARCHAR(255) UNIQUE,
      spotify_id VARCHAR(255) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `;

  // Create spotify_top_artists table
  await sql`
    CREATE TABLE IF NOT EXISTS spotify_top_artists (
      id SERIAL PRIMARY KEY,
      user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      artists JSONB NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `;

  // Create spotify_recent_tracks table
  await sql`
    CREATE TABLE IF NOT EXISTS spotify_recent_tracks (
      id SERIAL PRIMARY KEY,
      user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      tracks JSONB NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `;

  // Create indexes
  await sql`CREATE INDEX IF NOT EXISTS idx_user_spotify ON users(spotify_id);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_top_artists_user ON spotify_top_artists(user_id);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_recent_tracks_user ON spotify_recent_tracks(user_id);`;

  console.log('Database initialized successfully');
}
