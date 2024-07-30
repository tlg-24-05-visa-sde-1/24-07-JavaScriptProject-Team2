const playlistsContainer = document.getElementById('playlists');
const createPlaylistBtn = document.getElementById('createPlaylistBtn');
let playlists = JSON.parse(localStorage.getItem('playlists')) || [];

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
                ${playlist.songs.map((song, songIndex) => {
                    `<li>${song}<button class="deleteSongBtn" data-playlist-index="${index}" data-song-index="${songIndex}">Delete</button></li>`
                }).join('')}
            </ul>
        `;
        playlistsContainer.appendChild(playlistDiv);
    });

    document.querySelectorAll('.deletePlaylistBtn').forEach(button => {
        button.addEventListener('click', function() {
            deletePlaylist(this.getAttribute('data-index'));
        });
    });

    document.querySelectorAll('.addSongBtn').forEach(button => {
        button.addEventListener('click', function() {
            addSong(this.getAttribute('data-index'));
        });
    });

    document.querySelectorAll('.deleteSongBtn').forEach(button => {
        button.addEventListener('click', function() {
            deleteSong(this.getAttribute('data-playlist-index'), this.getAttribute('data-song-index'));
        });
    });
}

function deletePlaylist(index) {
    playlists.splice(index, 1);
    savePlaylists();
    renderPlaylists();
}

function addSong(index) {
    localStorage.setItem('currentPlaylistIndex', index);
    window.location.href = './search.html';
}

function deleteSong(playlistIndex, songIndex) {
    playlists[playlistIndex].songs.splice(songIndex, 1);
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

// Initial render of playlists
renderPlaylists();