import { getSpotifyPlaylist, getAlbumArt } from "../../spotifySearch.js";

const playlistsContainer = document.getElementById("playlists");
const createPlaylistForm = document.getElementById("createPlaylistForm");
let playlists = [];
let savedFeaturedPlaylists = [];

// Function to check and load local storage data
function checkLocalStorage() {
  playlists = JSON.parse(localStorage.getItem("playlists")) || [];
  savedFeaturedPlaylists = JSON.parse(localStorage.getItem("jampactPlaylists")) || [];

  // Remove duplicates from savedFeaturedPlaylists
  savedFeaturedPlaylists = [...new Set(savedFeaturedPlaylists)];

  // Filter out already existing playlists to avoid duplication
  savedFeaturedPlaylists = savedFeaturedPlaylists.filter(
    (playlistId) => !playlists.some((playlist) => playlist.id === playlistId)
  );

  // Check and add any saved featured playlists into playlists
  if (savedFeaturedPlaylists.length > 0) {
    addSavedFeaturedPlaylists(savedFeaturedPlaylists).then(() => {
      clearSavedFeaturedPlaylists();
    });
  }

  renderPlaylists();
}

// Clear saved featured playlists
function clearSavedFeaturedPlaylists() {
  savedFeaturedPlaylists = [];
  localStorage.setItem("jampactPlaylists", JSON.stringify(savedFeaturedPlaylists));
}

// Add saved featured playlists
async function addSavedFeaturedPlaylists(playlistIds) {
  for (const playlistId of playlistIds) {
    await addSpotifyPlaylist(playlistId);
  }
}

// Add a playlist from Spotify to the user's playlists
async function addSpotifyPlaylist(playlistId) {
  try {
    const newPlaylist = await getSpotifyPlaylist(playlistId);
    const limitedSongs = newPlaylist.songs.slice(0, 10); // Limiting songs to 10
    playlists.push({ ...newPlaylist, songs: limitedSongs, id: playlistId }); // Store playlistId to avoid duplicates
    savePlaylists();
    addPlaylistToDOM(newPlaylist, playlists.length - 1);
  } catch (error) {
    console.error("Error adding featured playlist:", error);
  }
}

// Save playlists to local storage
function savePlaylists() {
  localStorage.setItem("playlists", JSON.stringify(playlists));
}

// Function to get album art and display it
async function displayAlbumArt(songId) {
  try {
    const albumArtUrl = await getAlbumArt(songId);
    return albumArtUrl;
  } catch (error) {
    console.error("Error fetching album art:", error);
    return "https://via.placeholder.com/100"; // Placeholder in case of error
  }
}

// Display playlists on the screen
function renderPlaylists() {
  playlistsContainer.innerHTML = "";
  playlists.forEach((playlist, index) => {
    addPlaylistToDOM(playlist, index);
  });
}

// Add a playlist to the DOM
async function addPlaylistToDOM(playlist, index) {
  const playlistDiv = document.createElement("div");
  playlistDiv.className = "playlist";
  playlistDiv.innerHTML = `
    <div class="playlist-header">
        <h2>${playlist.name}</h2>
        <div class="buttonContainer">
            <button class="showHideBtn btn-sm" type="button" data-bs-toggle="collapse" data-bs-target="#collapsePlaylist${index}" aria-expanded="false" aria-controls="collapsePlaylist${index}">
                Show/Hide Songs
            </button>
            <button class="addSongBtn btn-sm" data-index="${index}">Add Song</button>
            <button class="deletePlaylistBtn btn-sm" data-index="${index}">Delete Playlist</button>
        </div>
    </div>
    <div class="collapse" id="collapsePlaylist${index}">
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
                            <button class="deleteSongBtn btn-sm" data-playlist-index="${index}" data-song-index="${songIndex}">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </li>
                `).join("")}
            </ul>
        </div>
    </div>
  `;
  playlistsContainer.appendChild(playlistDiv);

  // Fetch and display album art for each song
  const imgElements = playlistDiv.querySelectorAll(".album-art");
  for (const img of imgElements) {
    const songId = img.getAttribute("data-song-id");
    const albumArtUrl = await displayAlbumArt(songId);
    img.src = albumArtUrl;
  }
}

// Add a song
function addSong(index) {
  localStorage.setItem("currentPlaylistIndex", index);
  window.location.href = "../Search/search.html"; // Navigate to search page
}

// Delete a song
function deleteSong(playlistIndex, songIndex) {
  playlists[playlistIndex].songs.splice(songIndex, 1);
  savePlaylists();
  updatePlaylistInDOM(playlistIndex);
}

// Update playlist in the DOM
async function updatePlaylistInDOM(playlistIndex) {
  const playlistDiv = playlistsContainer.children[playlistIndex];
  const playlist = playlists[playlistIndex];
  const ulElement = playlistDiv.querySelector("ul");
  ulElement.innerHTML = playlist.songs.map((song, songIndex) => `
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
            <button class="deleteSongBtn btn-sm" data-playlist-index="${playlistIndex}" data-song-index="${songIndex}">
                <i class="fas fa-trash-alt"></i>
            </button>
        </div>
    </li>
  `).join("");

  const imgElements = ulElement.querySelectorAll(".album-art");
  for (const img of imgElements) {
    const songId = img.getAttribute("data-song-id");
    const albumArtUrl = await displayAlbumArt(songId);
    img.src = albumArtUrl;
  }
}

// Play a song using Spotify player
function playSong(songId) {
  const spotifyPlayer = document.getElementById("spotify-player");
  spotifyPlayer.innerHTML = `
    <iframe src="https://open.spotify.com/embed/track/${songId}" width="300" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>
  `;
}

// Delete a playlist
function deletePlaylist(index) {
  playlists.splice(index, 1);
  savePlaylists();
  removePlaylistFromDOM(index);
}

// Remove playlist from the DOM
function removePlaylistFromDOM(index) {
  const playlistDiv = playlistsContainer.children[index];
  playlistsContainer.removeChild(playlistDiv);
  updateDOMIndices();
}

// Update the data-index attributes in the DOM after deletion
function updateDOMIndices() {
  const playlistDivs = playlistsContainer.children;
  for (let i = 0; i < playlistDivs.length; i++) {
    const playlistDiv = playlistDivs[i];
    const showHideBtn = playlistDiv.querySelector(".showHideBtn");
    const addSongBtn = playlistDiv.querySelector(".addSongBtn");
    const deletePlaylistBtn = playlistDiv.querySelector(".deletePlaylistBtn");
    showHideBtn.setAttribute("data-bs-target", `#collapsePlaylist${i}`);
    showHideBtn.setAttribute("aria-controls", `collapsePlaylist${i}`);
    addSongBtn.setAttribute("data-index", i);
    deletePlaylistBtn.setAttribute("data-index", i);
  }
}

// Create a new playlist
createPlaylistForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const playlistName = document.getElementById("playlistName").value;
  if (playlistName) {
    const newPlaylist = { name: playlistName, songs: [], id: `user-${Date.now()}` }; // Assign a unique ID to user-created playlists
    playlists.push(newPlaylist);
    savePlaylists();
    addPlaylistToDOM(newPlaylist, playlists.length - 1);
    createPlaylistForm.reset();
  }
});

// Event delegation for playlists container
playlistsContainer.addEventListener("click", (event) => {
  if (event.target.closest(".deletePlaylistBtn")) {
    const index = Number(event.target.closest(".deletePlaylistBtn").getAttribute("data-index"));
    deletePlaylist(index);
  }
  if (event.target.closest(".addSongBtn")) {
    const index = Number(event.target.closest(".addSongBtn").getAttribute("data-index"));
    addSong(index);
  }
  if (event.target.closest(".deleteSongBtn")) {
    const playlistIndex = Number(event.target.closest(".deleteSongBtn").getAttribute("data-playlist-index"));
    const songIndex = Number(event.target.closest(".deleteSongBtn").getAttribute("data-song-index"));
    deleteSong(playlistIndex, songIndex);
  }
  if (event.target.closest(".playSongBtn")) {
    const songId = event.target.closest(".playSongBtn").getAttribute("data-song-id");
    playSong(songId);
  }
});

// Initial check and render of playlists
checkLocalStorage();
