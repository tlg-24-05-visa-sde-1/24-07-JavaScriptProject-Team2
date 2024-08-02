import { getSpotifyPlaylist, displayAlbumArt, searchTrackInfo } from "./spotifySearch.js";

const playlistsContainer = document.getElementById("playlists");
const createPlaylistForm = document.getElementById("createPlaylistForm");
let playlists = [];
let savedFeaturedPlaylists = [];

// ----------------- Local Storage Functions -------------------

// Function to check and load local storage data
async function checkLocalStorage() {
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
    await addSavedFeaturedPlaylists(savedFeaturedPlaylists);
    clearSavedFeaturedPlaylists();
  }

  // Check for selectedTrackURI and add to "Playlist - From Search"
  await addTracksFromLocalStorage();

  renderPlaylists();
}

// Save playlists to local storage
function savePlaylists() {
  localStorage.setItem("playlists", JSON.stringify(playlists));
}

// Clear saved featured playlists
function clearSavedFeaturedPlaylists() {
  savedFeaturedPlaylists = [];
  localStorage.setItem("jampactPlaylists", JSON.stringify(savedFeaturedPlaylists));
}

// ------------- Spotify Playlist Functions ----------------------

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
    displayPlaylist(newPlaylist, playlists.length - 1);
  } catch (error) {
    console.error("Error adding featured playlist:", error);
  }
}

// Play a song using Spotify player
function playSong(songId) {
  const spotifyPlayer = document.getElementById("spotify-player");
  spotifyPlayer.innerHTML = `
    <iframe src="https://open.spotify.com/embed/track/${songId}" width="300" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>
  `;
}

// Add tracks from local storage to "Playlist - From Search"
async function addTracksFromLocalStorage() {
  const selectedTrackURI = localStorage.getItem("selectedTrackURI");
  if (selectedTrackURI) {
    const trackURIs = selectedTrackURI.split(",");
    const trackIds = trackURIs.map(uri => uri.replace("spotify:track:", ""));

    const trackInfos = [];
    for (const trackId of trackIds) {
      const trackInfo = await searchTrackInfo(trackId);
      if (trackInfo) {
        trackInfos.push(trackInfo);
      }
    }

    if (trackInfos.length > 0) {
      let playlist = playlists.find(pl => pl.name === "Playlist - From Search");
      if (!playlist) {
        playlist = { name: "Playlist - From Search", songs: [], id: `user-search-${Date.now()}` };
        playlists.push(playlist);
      }
      playlist.songs.push(...trackInfos);
      savePlaylists();
    }
  }
}

// ----------------------- DOM Manipulation Functions ----------------------

// Display all playlists on the screen
function renderPlaylists() {
  playlistsContainer.innerHTML = "";
  playlists.forEach((playlist, index) => {
    displayPlaylist(playlist, index);
  });
}

// Display 1 playlist on the screen
async function displayPlaylist(playlist, index) {
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

// Update playlist on the screen
async function updatePlaylist(playlistIndex) {
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

// Remove playlist from the screen
function removePlaylist(index) {
  const playlistDiv = playlistsContainer.children[index];
  playlistsContainer.removeChild(playlistDiv);
  updatePlaylistIndices();
}

// Updating the data-index attributes after a playlist is deleted
function updatePlaylistIndices() {
  // Retrieve all child elements (assumed to be playlist divs) within the playlistsContainer
  const playlistDivs = playlistsContainer.children;

  // Loop through each playlist div
  for (let i = 0; i < playlistDivs.length; i++) {
    // Get the current playlist div
    const playlistDiv = playlistDivs[i];

    // Select the buttons within the current playlist div
    const showHideBtn = playlistDiv.querySelector(".showHideBtn");
    const addSongBtn = playlistDiv.querySelector(".addSongBtn");
    const deletePlaylistBtn = playlistDiv.querySelector(".deletePlaylistBtn");

    // Set attributes for the show/hide button
    showHideBtn.setAttribute("data-bs-target", `#collapsePlaylist${i}`);
    showHideBtn.setAttribute("aria-controls", `collapsePlaylist${i}`);

    // Set the data-index attribute for the add song button
    addSongBtn.setAttribute("data-index", i);

    // Set the data-index attribute for the delete playlist button
    deletePlaylistBtn.setAttribute("data-index", i);
  }
}

// ---------------------------- Playlist Modification Functions -----------------------------------

// Add a song
function addSong(index) {
  localStorage.setItem("currentPlaylistIndex", index);
  window.location.href = "../Search/search.html"; // Navigate to search page
}

// Delete a song
function deleteSong(playlistIndex, songIndex) {
  playlists[playlistIndex].songs.splice(songIndex, 1);
  savePlaylists();
  updatePlaylist(playlistIndex);
}

// Delete a playlist
function deletePlaylist(index) {
  playlists.splice(index, 1);
  savePlaylists();
  removePlaylist(index);
}

// ------------------- Event Listeners -------------------------------

// Create a new playlist
createPlaylistForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const playlistName = document.getElementById("playlistName").value;
  if (playlistName) {
    const newPlaylist = { name: playlistName, songs: [], id: `user-${Date.now()}` }; // Assigning a unique ID to user-created playlists
    playlists.push(newPlaylist);
    savePlaylists();
    displayPlaylist(newPlaylist, playlists.length - 1);
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
