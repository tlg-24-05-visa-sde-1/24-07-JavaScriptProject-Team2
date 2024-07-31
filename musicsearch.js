document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('musicSearch').addEventListener('submit', async function(event) {
        event.preventDefault(); // Prevent form from submitting the traditional way
        const query = document.getElementById('searchParams').value;
        console.log('Search Query:', query); // Log the search query
        if (query) {
            searchMusic(query);
        }
    });
});

async function searchMusic(query) {
    const url = `https://spotify23.p.rapidapi.com/search/?q=${encodeURIComponent(query)}&type=multi&offset=0&limit=10&numberOfTopResults=5`;
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': '7eff719610mshd09fed54482ddb5p106324jsndd1bddc838d6',
            'x-rapidapi-host': 'spotify23.p.rapidapi.com'
        }
    };

    try {
        const response = await fetch(url, options);
        const result = await response.json();
        console.log(result);
        displayResults(result);
    } catch (error) {
        console.error(`Error fetching data: ${error.message}`);
    }
}

function displayResults(data) {
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = ''; // Clear previous results

    // Assuming data.tracks.items contains the search results
    if (data.tracks && data.tracks.items) {
        data.tracks.items.forEach(item => {
            const resultItem = document.createElement('div');
            resultItem.classList.add('result-item');
            resultItem.textContent = `${item.name} by ${item.artists[0].name}`;
            resultsContainer.appendChild(resultItem);
        });
    }
}