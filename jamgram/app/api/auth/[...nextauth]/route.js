// import the core NextAuth.js library & the Spotify authentication provider from NextAuth
import NextAuth from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";

// Configuration object that defines how NextAuth should behave
export const authOptions = {
  // define which login providers to support
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,

      // define the scopes we request from Spotify
      authorization:
        "https://accounts.spotify.com/authorize?scope=user-read-email,user-read-private,user-top-read,user-library-read,playlist-read-private",
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  // callback functions
  callbacks: {
    // called whenever a jwt (JSON Web Token) is created or updated
    async jwt({ token, account }) {
      // if first sign in, load Spotify access token
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },

    // called whenever a session is checked or created on the client side
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      return session;
    },
  },
};

// creating the handler
const handler = NextAuth(authOptions);

// export the handler for both GET and POST requests
export { handler as GET, handler as POST };
