document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('musicSearch').addEventListener('submit', async function(event) {
        event.preventDefault(); // Prevent form from submitting the traditional way
        const query = document.getElementById('searchParams').value;
        if (query) {
            searchMusic(query);
        }
    });

    // Hide the results section initially
    document.getElementById('results-section').style.display = 'none';
});

async function searchMusic(query) {
    const url = `https://spotify23.p.rapidapi.com/search/?q=${encodeURIComponent(query)}&type=multi&offset=0&limit=20&numberOfTopResults=20`;
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': '7eff719610mshd09fed54482ddb5p106324jsndd1bddc838d6', // Your RapidAPI key
            'x-rapidapi-host': 'spotify23.p.rapidapi.com'
        }
    };

    try {
        const response = await fetch(url, options);
        const result = await response.json();
        displayResults(result);
    } catch (error) {
        console.error('Error fetching data:', error.message);
    }
}

function displayResults(data) {
    const resultsContainer = document.getElementById('search-sections');
    resultsContainer.innerHTML = ''; // Clear previous results

    // Column creation
    const columns = ['Tracks', 'Similar Artists', 'Albums'];
    const row = document.createElement('div');
    row.className = 'row';

    columns.forEach(columnName => {
        const col = document.createElement('div');
        col.className = 'col';
        const heading = document.createElement('h4');
        heading.textContent = columnName;
        col.appendChild(heading);
        const list = document.createElement('ul');
        list.className = 'list-unstyled';
        col.appendChild(list);
        row.appendChild(col);
    });

    resultsContainer.appendChild(row);

    // Function to remove duplicate results
    function removeDuplicates(array, keyFunc) {
        const seen = new Set();
        return array.filter(item => {
            const key = keyFunc(item);
            if (!seen.has(key)) {
                seen.add(key);
                return true;
            }
            return false;
        });
    }

    // Create list items in search results
    function createListItem(text, data) {
        const li = document.createElement('li');
        li.className = 'result-item';
        
        const textDiv = document.createElement('div');
        textDiv.className = 'result-item-text';
        textDiv.textContent = text;

        const toggleIcon = document.createElement('span');
        toggleIcon.textContent = '▼';
        toggleIcon.style.marginLeft = '10px';
        textDiv.appendChild(toggleIcon);

        li.appendChild(textDiv);

        li.addEventListener('click', () => toggleDropdown(li, data, toggleIcon));
        return li;
    }

    // Toggle dropdown for result items
    function toggleDropdown(li, data, toggleIcon) {
        let dropdown = li.querySelector('.dropdown-content');
        if (dropdown) {
            dropdown.remove();
            toggleIcon.textContent = '▼';
        } else {
            dropdown = document.createElement('div');
            dropdown.className = 'dropdown-content';
            populateDropdown(dropdown, data);
            li.appendChild(dropdown);
            toggleIcon.textContent = '▲';
        }
    }

    // Populate dropdown with data
    function populateDropdown(dropdown, data) {
        if (data.type === 'track') {
            const album = data.album || {};
            const artist = data.artist || {};
            const track = data.track || {};
            const duration = data.duration || 'N/A';

            dropdown.innerHTML = `
                <div class="dropdown-section">
                    <h5>Album</h5>
                    <div class="dropdown-item">
                        <img src="${album.image || ''}" alt="${album.name || 'Album'}" class="thumbnail">
                        <span>${album.name || 'N/A'}</span>
                    </div>
                </div>
                <div class="dropdown-section">
                    <h5>Artist</h5>
                    <div class="dropdown-item">${artist.name || 'N/A'}</div>
                </div>
                <div class="dropdown-section">
                    <h5>Track</h5>
                    <div class="dropdown-item">${track.name || 'N/A'}</div>
                </div>
                <div class="dropdown-section">
                    <h5>Duration</h5>
                    <div class="dropdown-item">${duration}</div>
                </div>
            `;
        } else if (data.type === 'artist') {
            const albums = data.albums || [];
            dropdown.innerHTML = '<h5>Discography</h5>';
            if (albums.length === 0) {
                dropdown.innerHTML += '<div class="dropdown-item">No albums found</div>';
            } else {
                albums.forEach(album => {
                    const albumItem = document.createElement('div');
                    albumItem.className = 'dropdown-item';
                    albumItem.innerHTML = `
                        <img src="${album.image || ''}" alt="${album.name || 'Album'}" class="thumbnail">
                        <span>${album.name || 'Unknown Album'}</span>
                    `;
                    dropdown.appendChild(albumItem);
                });
            }
        } else if (data.type === 'album') {
            const album = data.album || {};
            const tracks = data.tracks || [];
            dropdown.innerHTML = `
                <div class="dropdown-section">
                    <h5>Album</h5>
                    <div class="dropdown-item">
                        <img src="${album.image || ''}" alt="${album.name || 'Album'}" class="thumbnail">
                        <span>${album.name || 'N/A'}</span>
                        <span>${album.releaseDate || 'N/A'}</span>
                    </div>
                </div>
                <div class="dropdown-section">
                    <h5>Track Listing</h5>
                    <ol class="dropdown-item">
                        ${tracks.map(track => `<li>${track.name || 'Unknown Track'}</li>`).join('')}
                    </ol>
                </div>
            `;
        }
    }

    // Populate columns with search results

    // Display tracks
    if (data.tracks && data.tracks.items) {
        console.log('Displaying tracks:', data.tracks.items);
        const tracksList = row.children[0].querySelector('ul');
        const uniqueTracks = removeDuplicates(data.tracks.items, 
            item => `${item.data.name}-${item.data.artists.items[0].profile.name}`);
        uniqueTracks.forEach(item => {
            if (item.data && item.data.name && item.data.artists && item.data.artists.items && item.data.artists.items[0] && item.data.artists.items[0].profile && item.data.artists.items[0].profile.name) {
                const trackData = {
                    type: 'track',
                    album: {
                        name: item.data.albumOfTrack?.name,
                        image: item.data.albumOfTrack?.coverArt?.sources[0]?.url
                    },
                    artist: {
                        name: item.data.artists.items[0].profile.name
                    },
                    track: {
                        name: item.data.name
                    },
                    duration: item.data.duration?.totalMilliseconds
                };
                const li = createListItem(`${item.data.name} by ${item.data.artists.items[0].profile.name}`, trackData);
                tracksList.appendChild(li);
            } 
        });
    }

    // Display artists
    if (data.artists && data.artists.items) {
        console.log('Displaying artists:', data.artists.items);
        const artistsList = row.children[1].querySelector('ul');
        const uniqueArtists = removeDuplicates(data.artists.items, 
            item => item.data.profile.name);
        uniqueArtists.forEach(item => {
            if (item.data && item.data.profile && item.data.profile.name) {
                const artistData = {
                    type: 'artist',
                    albums: item.data.discography?.albums?.items?.map(album => ({
                        name: album.name,
                        image: album.coverArt?.sources[0]?.url
                    })) || []
                };
                const li = createListItem(item.data.profile.name, artistData);
                artistsList.appendChild(li);
            }
        });
    }

    // Display albums
    if (data.albums && data.albums.items) {
        console.log('Displaying albums:', data.albums.items);
        const albumsList = row.children[2].querySelector('ul');
        const uniqueAlbums = removeDuplicates(data.albums.items, 
            item => `${item.data.name}-${item.data.artists.items[0].profile.name}`);
        uniqueAlbums.forEach(item => {
            if (item.data && item.data.name && item.data.artists && item.data.artists.items && item.data.artists.items[0] && item.data.artists.items[0].profile && item.data.artists.items[0].profile.name) {
                const albumData = {
                    type: 'album',
                    album: {
                        name: item.data.name,
                        image: item.data.coverArt?.sources[0]?.url,
                        releaseDate: item.data.date?.year
                    },
                    tracks: item.data.tracks?.items?.map(track => ({
                        name: track.name
                    })) || []
                };
                const li = createListItem(`${item.data.name} by ${item.data.artists.items[0].profile.name}`, albumData);
                albumsList.appendChild(li);
            }
        });
    }

    // Show results section
    document.getElementById('results-section').style.display = 'block';
}