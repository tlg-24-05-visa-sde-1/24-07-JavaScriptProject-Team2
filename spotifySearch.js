const clientId = '659ee4ad509f4262b8e6b8dbdc75a739';
const clientSecret = 'e77f9f1ed07a4bff8b05afe1b5d8042e';

// Function to get an access token from Spotify
async function getToken() {
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
        },
        body: 'grant_type=client_credentials'
    });
    const data = await response.json();
    return data.access_token;
}

// Function to search for items on Spotify
export async function searchSpotify(type, query) {
    const token = await getToken();
    const response = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=${type}&limit=10`, {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token }
    });
    const data = await response.json();
    return data;
}

// Function to get track information by track ID
export async function searchTrackInfo(trackId) {
    const token = await getToken();
    const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token }
    });
    const data = await response.json();

    const trackInfo = {
        name: data.name,
        artist: data.artists.map(artist => artist.name).join(', '),
        album: data.album.name,
        duration: data.duration_ms,
        id: data.id
    };

    return trackInfo;
}