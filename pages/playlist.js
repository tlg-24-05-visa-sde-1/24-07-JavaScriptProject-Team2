const playlistsContainer = document.getElementById('playlists');
const createPlaylistForm = document.getElementById('createPlaylistForm');
let playlists = JSON.parse(localStorage.getItem('playlists')) || [];

// SAMPLE DATA 
// if (playlists.length === 0) {
//     playlists = [
//         {
//             name: "Rock Classics",
//             songs: [
//                 { name: "Bohemian Rhapsody", artist: "Queen", album: "A Night at the Opera", duration: "5:55", id: "1" },
//                 { name: "Stairway to Heaven", artist: "Led Zeppelin", album: "Led Zeppelin IV", duration: "8:02", id: "2" },
//                 { name: "Hotel California", artist: "Eagles", album: "Hotel California", duration: "6:30", id: "3" }
//             ]
//         },
//         {
//             name: "Pop Hits",
//             songs: [
//                 { name: "Blinding Lights", artist: "The Weeknd", album: "After Hours", duration: "3:20", id: "4" },
//                 { name: "Levitating", artist: "Dua Lipa", album: "Future Nostalgia", duration: "3:23", id: "5" },
//                 { name: "Peaches", artist: "Justin Bieber", album: "Justice", duration: "3:18", id: "6" }
//             ]
//         },
//         {
//             name: "Jazz Essentials",
//             songs: [
//                 { name: "So What", artist: "Miles Davis", album: "Kind of Blue", duration: "9:22", id: "7" },
//                 { name: "Take Five", artist: "Dave Brubeck", album: "Time Out", duration: "5:24", id: "8" },
//                 { name: "Blue in Green", artist: "Bill Evans", album: "Kind of Blue", duration: "5:27", id: "9" }
//             ]
//         }
//     ];
//     savePlaylists();
// }

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
            <h2>${playlist.name}</h2>
            <button class="deletePlaylistBtn btn-sm" data-index="${index}">Delete Playlist</button>
            <button class="addSongBtn  btn-sm" data-index="${index}">Add Song</button>
            <ul>
                ${playlist.songs.map((song, songIndex) => `
                    <li>
                        <strong>${song.name}</strong> by ${song.artist} from the album ${song.album} (${song.duration})
                        <button class="deleteSongBtn btn-sm" data-playlist-index="${index}" data-song-index="${songIndex}">Delete</button>
                    </li>
                `).join('')}
            </ul>
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
