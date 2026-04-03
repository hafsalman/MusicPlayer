const axios = require("axios");

let accessToken = null;

// Get Spotify Access Token
const getAccessToken = async () => {
    const response = await axios.post(
        "https://accounts.spotify.com/api/token",
        new URLSearchParams({
            grant_type: "client_credentials"
        }),
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": "Basic " + Buffer.from(
                    process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET
                ).toString("base64")
            }
        }
    );

    accessToken = response.data.access_token;
};

// Search Songs
const searchSongs = async (query) => {
    if (!accessToken) {
        await getAccessToken();
    }

    const response = await axios.get(
        `https://api.spotify.com/v1/search?q=${query}&type=track&limit=10`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }
    );

    return response.data.tracks.items;
};

module.exports = { searchSongs };