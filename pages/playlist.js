import { getSpotifyPlaylist, getAlbumArt } from '../spotifySearch.js';

const playlistsContainer = document.getElementById('playlists');
const createPlaylistForm = document.getElementById('createPlaylistForm');
let playlists = JSON.parse(localStorage.getItem('playlists')) || [];
let savedFeaturedPlaylists = JSON.parse(localStorage.getItem('jampactPlaylists')) || [];

// check and adding any saved featured playlists into playlists
if (savedFeaturedPlaylists.length > 0) {
    addSavedFeaturedPlaylists(savedFeaturedPlaylists).then(() => {
        clearSavedFeaturedPlaylists();
    });
}

function clearSavedFeaturedPlaylists() {
    savedFeaturedPlaylists = [];
    localStorage.setItem('jampactPlaylists', JSON.stringify(savedFeaturedPlaylists));
}

// Adding saved featured playlists
async function addSavedFeaturedPlaylists(playlistIds) {
    for (const playlistId of playlistIds) {
        if (!playlists.some(playlist => playlist.id === playlistId)) {
            await addSpotifyPlaylist(playlistId);
        }
    }
}

// Adding a playlist from Spotify to the user's playlists
async function addSpotifyPlaylist(playlistId) {
    try {
        const newPlaylist = await getSpotifyPlaylist(playlistId);
        playlists.push({ ...newPlaylist, id: playlistId }); // Store playlistId to avoid duplicates
        savePlaylists();
        renderPlaylists();
    } catch (error) {
        console.error('Error adding featured playlist:', error);
    }
}

// Saving playlists to local storage
function savePlaylists() {
    localStorage.setItem('playlists', JSON.stringify(playlists));
}

// Function to get album art and display it
async function displayAlbumArt(songId) {
    try {
        const albumArtUrl = await getAlbumArt(songId);
        return albumArtUrl;
    } catch (error) {
        console.error('Error fetching album art:', error);
        return 'https://via.placeholder.com/100'; // Placeholder in case of error
    }
}

// Displaying playlists on the screen
async function renderPlaylists() {
    playlistsContainer.innerHTML = '';
    for (const playlist of playlists) {
        const playlistDiv = document.createElement('div');
        playlistDiv.className = 'playlist';
        playlistDiv.innerHTML = `
            <div class="playlist-header">
                <h2>${playlist.name}</h2>
                <div class="buttonContainer">
                    <button class="addSongBtn btn-sm" data-index="${playlists.indexOf(playlist)}">Add Song</button>
                    <button class="deletePlaylistBtn btn-sm" data-index="${playlists.indexOf(playlist)}">Delete Playlist</button>
                </div>
            </div>
            <div class="playlist-table">
                <div class="playlist-table-header">
                    <div class="playlist-table-col">Album Art</div>
                    <div class="playlist-table-col">Name</div>
                    <div class="playlist-table-col">Artist/Band</div>
                </div>
                <ul>
                    ${playlist.songs.map((song, songIndex) => `
                        <li class="d-flex align-items-center">
                            <div class="playlist-table-col">
                                <img src="https://via.placeholder.com/100" alt="${song.album}" class="album-art img-fluid d-none d-md-block" data-song-id="${song.id}" width="100" height="100">
                            </div>
                            <div class="playlist-table-col">${song.name}</div>
                            <div class="playlist-table-col d-none d-md-block">${song.artist}</div>
                            <div class="buttonContainer ms-auto">
                                <button class="playSongBtn btn-sm" data-song-id="${song.id}">
                                    <i class="fas fa-play"></i>
                                </button>
                                <button class="deleteSongBtn btn-sm" data-playlist-index="${playlists.indexOf(playlist)}" data-song-index="${songIndex}">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </div>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
        playlistsContainer.appendChild(playlistDiv);

        // Fetch and display album art for each song
        const imgElements = playlistDiv.querySelectorAll('.album-art');
        for (const img of imgElements) {
            const songId = img.getAttribute('data-song-id');
            const albumArtUrl = await displayAlbumArt(songId);
            img.src = albumArtUrl;
        }
    }
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

// Initial render of playlists
renderPlaylists();
