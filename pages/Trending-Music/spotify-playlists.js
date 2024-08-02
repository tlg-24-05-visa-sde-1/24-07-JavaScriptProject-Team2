const clientId = '659ee4ad509f4262b8e6b8dbdc75a739';
const clientSecret = 'e77f9f1ed07a4bff8b05afe1b5d8042e';

 
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
 
async function fetchPlaylists(endpoint) {
    const token = await getToken();
    const url = `https://api.spotify.com/v1/${endpoint}`;
    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.playlists.items;
    } catch (error) {
        console.error('Error fetching playlists:', error);
        return [];
    }
}
 
 

function displayPlaylists(playlists, elementId) {
    const listElement = document.getElementById(elementId);
    listElement.innerHTML = '';
    playlists.forEach(playlist => {
        const listItem = document.createElement('li');
        listItem.textContent = playlist.name;
        listItem.classList.add('list-group-item');

        const playlistName = document.createElement('span');
        playlistName.textContent = playlist.name;
        listItem.appendChild(playlistName);

        if (elementId === 'trending-list') {
            const addButton = document.createElement('button');
            addButton.textContent = 'Add to Jampact Playlist';
            addButton.classList.add('btn', 'btn-sm', 'btn-success', 'ml-2');
            addButton.addEventListener('click', () => addToPersonalPlaylist(playlist));
            listItem.appendChild(addButton);
        }

        listElement.appendChild(listItem);

    });
}

function addToPersonalPlaylist(playlist) {
    saveToLocalStorage(playlist.id);
}

function saveToLocalStorage(playlistId) {
    let storedPlaylists = JSON.parse(localStorage.getItem('jampactPlaylists')) || [];
    if (!storedPlaylists.includes(playlistId)) {
        storedPlaylists.push(playlistId);
        localStorage.setItem('jampactPlaylists', JSON.stringify(storedPlaylists));
    }
}




async function loadPlaylists() {
    const featuredPlaylists = await fetchPlaylists('browse/featured-playlists');
    displayPlaylists(featuredPlaylists, 'trending-list');
    
}

loadPlaylists();