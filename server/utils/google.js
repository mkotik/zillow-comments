const { OAuth2Client } = require("google-auth-library");

function getGoogleClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error("GOOGLE_CLIENT_ID is required");
  return new OAuth2Client(clientId);
}

async function verifyGoogleIdToken(idToken) {
  const client = getGoogleClient();
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  return ticket.getPayload();
}

module.exports = { verifyGoogleIdToken };


