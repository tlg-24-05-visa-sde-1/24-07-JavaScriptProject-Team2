document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('musicSearch').addEventListener('submit', async function(event) {
        event.preventDefault(); // Prevent form from submitting the traditional way
        const query = document.getElementById('searchParams').value;
        if (query) {
            searchMusic(query);
        }
    });
});

async function searchMusic(query) {
    const url = `https://spotify23.p.rapidapi.com/search/?q=${encodeURIComponent(query)}&type=multi&offset=0&limit=10&numberOfTopResults=10`;
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
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = ''; // Clear previous results

    // Display tracks
    if (data.tracks && data.tracks.items) {
        data.tracks.items.forEach(item => {
            if (item.data && item.data.name && item.data.artists && item.data.artists.items && item.data.artists.items[0] && item.data.artists.items[0].profile && item.data.artists.items[0].profile.name) {
                const resultItem = document.createElement('div');
                resultItem.classList.add('result-item');
                resultItem.textContent = `${item.data.name} by ${item.data.artists.items[0].profile.name}`;
                resultsContainer.appendChild(resultItem);
            }
        });
    }

    // Display artists
    if (data.artists && data.artists.items) {
        data.artists.items.forEach(item => {
            if (item.data && item.data.profile && item.data.profile.name) {
                const resultItem = document.createElement('div');
                resultItem.classList.add('result-item');
                resultItem.textContent = item.data.profile.name;
                resultsContainer.appendChild(resultItem);
            }
        });
    }

    // Display albums
    if (data.albums && data.albums.items) {
        data.albums.items.forEach(item => {
            if (item.data && item.data.name && item.data.artists && item.data.artists.items && item.data.artists.items[0] && item.data.artists.items[0].profile && item.data.artists.items[0].profile.name) {
                const resultItem = document.createElement('div');
                resultItem.classList.add('result-item');
                resultItem.textContent = `${item.data.name} by ${item.data.artists.items[0].profile.name}`;
                resultsContainer.appendChild(resultItem);
            }
        });
    }
}

