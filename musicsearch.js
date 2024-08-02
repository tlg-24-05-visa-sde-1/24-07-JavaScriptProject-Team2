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
    function createListItem(text) {
        const li = document.createElement('li');
        li.textContent = text;
        li.className = 'result-item';
        return li;
    }

    // Populate columns with search results

    // Display tracks
    if (data.tracks && data.tracks.items) {
        const tracksList = row.children[0].querySelector('ul');
        const uniqueTracks = removeDuplicates(data.tracks.items, 
            item => `${item.data.name}-${item.data.artists.items[0].profile.name}`);
        uniqueTracks.forEach(item => {
            if (item.data && item.data.name && item.data.artists && item.data.artists.items && item.data.artists.items[0] && item.data.artists.items[0].profile && item.data.artists.items[0].profile.name) {
                const li = createListItem(`${item.data.name} by ${item.data.artists.items[0].profile.name}`);
                tracksList.appendChild(li);
            } 
        });
    }

    // Display artists
    if (data.artists && data.artists.items) {
        const artistsList = row.children[1].querySelector('ul');
        const uniqueArtists = removeDuplicates(data.artists.items, 
            item => item.data.profile.name);
        uniqueArtists.forEach(item => {
            if (item.data && item.data.profile && item.data.profile.name) {
                const li = createListItem(item.data.profile.name);
                artistsList.appendChild(li);
            }
        });
    }

    // Display albums
    if (data.albums && data.albums.items) {
        const albumsList = row.children[2].querySelector('ul');
        const uniqueAlbums = removeDuplicates(data.albums.items, 
            item => `${item.data.name}-${item.data.artists.items[0].profile.name}`);
        uniqueAlbums.forEach(item => {
            if (item.data && item.data.name && item.data.artists && item.data.artists.items && item.data.artists.items[0] && item.data.artists.items[0].profile && item.data.artists.items[0].profile.name) {
                const li = createListItem(`${item.data.name} by ${item.data.artists.items[0].profile.name}`);
                albumsList.appendChild(li);
            }
        });
    }

    // Show results section
    document.getElementById('results-section').style.display = 'block';
}
