const playlistsContainer = document.getElementById('playlists');
const createPlaylistBtn = document.getElementById('createPlaylistBtn');
let playlists = JSON.parse(localStorage.getItem('playlists')) || [];

// SAMPLE DATA --comment out AFTER!!!
// if (playlists.length === 0) {
//     playlists = [
//         {
//             name: "Rock Classics",
//             songs: ["Bohemian Rhapsody", "Stairway to Heaven", "Hotel California"]
//         },
//         {
//             name: "Pop Hits",
//             songs: ["Blinding Lights", "Levitating", "Peaches"]
//         },
//         {
//             name: "Jazz Essentials",
//             songs: ["So What", "Take Five", "Blue in Green"]
//         }
//     ];
//     savePlaylists();
// }

//saving playlists to local storage
function savePlaylists() {
    localStorage.setItem('playlists', JSON.stringify(playlists));
}

//Displaying playlists on the screen
function renderPlaylists() {
    playlistsContainer.innerHTML = '';
    playlists.forEach((playlist, index) => {
        const playlistDiv = document.createElement('div');
        playlistDiv.className = 'playlist';
        playlistDiv.innerHTML = `
            <h2>${playlist.name}</h2>
            <button class="deletePlaylistBtn" data-index="${index}">Delete Playlist</button>
            <button class="addSongBtn" data-index="${index}">Add Song</button>
            <ul>
                ${playlist.songs.map((song, songIndex) => `
                    <li>${song}<button class="deleteSongBtn" data-playlist-index="${index}" data-song-index="${songIndex}">Delete</button></li>
                `).join('')}
            </ul>
        `;
        playlistsContainer.appendChild(playlistDiv);
    });
}

//deleting playlist
function deletePlaylist(index) {
    playlists = playlists.filter((element, i) => i !== index);
    savePlaylists();
    renderPlaylists();
}

//adding a song
function addSong(index) {
    localStorage.setItem('currentPlaylistIndex', index);
    window.location.href = './search.html';   //accesses the current window location object and sets it ./search.html, window navigation 
}

//deleting a song
function deleteSong(playlistIndex, songIndex) {
    //getting songs from selected playlist
    let selectedPlaylist = playlists[playlistIndex];
    let songs = selectedPlaylist.songs;

    //removing selected song, updating songs in the playlist + playlist array
    let updatedSongs = songs.filter((element, i) => i !== songIndex);
    selectedPlaylist.songs = updatedSongs;
    playlists[playlistIndex] = selectedPlaylist;

    savePlaylists();
    renderPlaylists();
}

//creating a new playlist
createPlaylistBtn.addEventListener('click', () => {
    const playlistName = prompt('Enter the name of the new playlist:');
    if (playlistName) {
        playlists.push({ name: playlistName, songs: [] });
        savePlaylists();
        renderPlaylists();
    }
});

// Event delegation for playlists container
playlistsContainer.addEventListener('click', (event) => {
    if (event.target.classList.contains('deletePlaylistBtn')) {
        const index = Number(event.target.getAttribute('data-index'));
        deletePlaylist(index);
    }
    if (event.target.classList.contains('addSongBtn')) {
        const index = Number(event.target.getAttribute('data-index'));
        addSong(index);
    }
    if (event.target.classList.contains('deleteSongBtn')) {
        const playlistIndex = Number(event.target.getAttribute('data-playlist-index'));
        const songIndex = Number(event.target.getAttribute('data-song-index'));
        deleteSong(playlistIndex, songIndex);
    }
});

// Initial render of playlists
renderPlaylists();
