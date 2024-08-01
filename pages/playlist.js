const playlistsContainer = document.getElementById('playlists');
const createPlaylistForm = document.getElementById('createPlaylistForm');
let playlists = JSON.parse(localStorage.getItem('playlists')) || [];

// SAMPLE DATA 
if (playlists.length === 0) {
    playlists = [
        {
            name: "Rock Classics",
            songs: [
                { name: "Bohemian Rhapsody", artist: "Queen", album: "A Night at the Opera", id: "7tFiyTwD0nx5a1eklYtX2J" },
                { name: "Stairway to Heaven", artist: "Led Zeppelin", album: "Led Zeppelin IV", id: "5CQ30WqJwcep0pYcV4AMNc" },
                { name: "Hotel California", artist: "Eagles", album: "Hotel California", id: "40riOy7x9W7GXjyGp4pjAv" }
            ]
        },
        {
            name: "Pop Hits",
            songs: [
                { name: "Blinding Lights", artist: "The Weeknd", album: "After Hours", id: "0VjIjW4GlUZAMYd2vXMi3b" },
                { name: "Levitating", artist: "Dua Lipa", album: "Future Nostalgia", id: "463CkQjx2Zk1yXoBuierM9" },
                { name: "Peaches", artist: "Justin Bieber", album: "Justice", id: "4iJyoBOLtHqaGxP12qzhQI" }
            ]
        },
        {
            name: "Jazz Essentials",
            songs: [
                { name: "So What", artist: "Miles Davis", album: "Kind of Blue", id: "1j7FJYqTzWqFIqKpx6ehim" },
                { name: "Take Five", artist: "Dave Brubeck", album: "Time Out", id: "3RBlTvr5f7syHp8bTyzbZs" },
                { name: "Blue in Green", artist: "Bill Evans", album: "Kind of Blue", id: "1eTMa3gUgIeOJGOc9s3I5D" }
            ]
        }
    ];
    savePlaylists();
}

// Saving playlists to local storage
function savePlaylists() {
    localStorage.setItem('playlists', JSON.stringify(playlists));
}

// Displaying playlists on the screen
function renderPlaylists() {
    playlistsContainer.innerHTML = '';
    playlists.forEach((playlist, index) => {
        const playlistDiv = document.createElement('div');
        playlistDiv.className = 'playlist';
        playlistDiv.innerHTML = `
            <div class="playlist-header">
                <h2>${playlist.name}</h2>
                <div class="buttonContainer">
                    <button class="addSongBtn btn-sm" data-index="${index}">Add Song</button>
                    <button class="deletePlaylistBtn btn-sm" data-index="${index}">Delete Playlist</button>
                </div>
            </div>
            <div class="playlist-table">
                <div class="playlist-table-header">
                    <div class="playlist-table-col">Name</div>
                    <div class="playlist-table-col">Artist/Band</div>
                </div>
                <ul>
                    ${playlist.songs.map((song, songIndex) => `
                        <li>
                            <div class="buttonContainer">
                                <button class="playSongBtn btn-sm" data-song-id="${song.id}">
                                    <i class="fas fa-play"></i>
                                </button>
                                <button class="deleteSongBtn btn-sm" data-playlist-index="${index}" data-song-index="${songIndex}">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </div>
                            <div class="playlist-table-col">${song.name}</div>
                            <div class="playlist-table-col">${song.artist}</div>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
        playlistsContainer.appendChild(playlistDiv);
    });
}

// Deleting playlist
function deletePlaylist(index) {
    playlists = playlists.filter((element, i) => i !== index);
    savePlaylists();
    renderPlaylists();
}

// Adding a song
function addSong(index) {
    localStorage.setItem('currentPlaylistIndex', index);
    window.location.href = './search.html'; // navigate to search page
}

// Deleting a song
function deleteSong(playlistIndex, songIndex) {
    let selectedPlaylist = playlists[playlistIndex];
    selectedPlaylist.songs = selectedPlaylist.songs.filter((element, i) => i !== songIndex);
    playlists[playlistIndex] = selectedPlaylist;
    savePlaylists();
    renderPlaylists();
}

// Play a song using Spotify player
function playSong(songId) {
    const spotifyPlayer = document.getElementById('spotify-player');
    spotifyPlayer.innerHTML = `
        <iframe src="https://open.spotify.com/embed/track/${songId}" width="300" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>
    `;
}

// Creating a new playlist
createPlaylistForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const playlistName = document.getElementById('playlistName').value;
    if (playlistName) {
        playlists.push({ name: playlistName, songs: [] });
        savePlaylists();
        renderPlaylists();
        createPlaylistForm.reset();
    }
});

// Event delegation for playlists container
playlistsContainer.addEventListener('click', (event) => {
    if (event.target.closest('.deletePlaylistBtn')) {
        const index = Number(event.target.closest('.deletePlaylistBtn').getAttribute('data-index'));
        deletePlaylist(index);
    }
    if (event.target.closest('.addSongBtn')) {
        const index = Number(event.target.closest('.addSongBtn').getAttribute('data-index'));
        addSong(index);
    }
    if (event.target.closest('.deleteSongBtn')) {
        const playlistIndex = Number(event.target.closest('.deleteSongBtn').getAttribute('data-playlist-index'));
        const songIndex = Number(event.target.closest('.deleteSongBtn').getAttribute('data-song-index'));
        deleteSong(playlistIndex, songIndex);
    }
    if (event.target.closest('.playSongBtn')) {
        const songId = event.target.closest('.playSongBtn').getAttribute('data-song-id');
        playSong(songId);
    }
});

// Function to get the current available playlists
export function getPlaylists() {
    return playlists;
}

// Function to add a song to a selected playlist
export async function addSongToPlaylist(songId, playlistName) {
    const songInfo = await searchTrackInfo(songId);
    const playlist = playlists.find(pl => pl.name === playlistName);

    if (playlist) {
        playlist.songs.push({
            name: songInfo.name,
            artist: songInfo.artist,
            album: songInfo.album,
            id: songInfo.id
        });
        savePlaylists();
        renderPlaylists();
    } else {
        console.error('Playlist not found');
    }
}

// Initial render of playlists
renderPlaylists();
