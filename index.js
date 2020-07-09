// Autocomplete config to use in our external module
const autoCompleteConfig = {
    renderOption(movie) {
        const imgScr = movie.Poster === "N/A" ? "" : movie.Poster;
        return `
            <img src="${imgScr}"/>
            ${movie.Title} (${movie.Year})
        `;
    },
    inputValue(movie){
        return movie.Title
    },
    async fetchData(sTerm) {
        const response = await axios.get('http://www.omdbapi.com/', {
            params: {
                apikey: "b4c1d05",
                s: sTerm
            }
        });
    
        if (response.data.Error) return [];
        return response.data.Search
    }
};

// Create autocomplete search boxes for each side of the app
createAutoComplete({
    ...autoCompleteConfig,
    root: document.querySelector('#left-autocomplete'),
    onOptionSelect(movie) {
        document.querySelector('.tutorial').classList.add('is-hidden')
        onMovieSelect(movie, document.querySelector('#left-summary'), 'left')
    }
});

createAutoComplete({
    ...autoCompleteConfig,
    root: document.querySelector('#right-autocomplete'),
    onOptionSelect(movie) {
        document.querySelector('.tutorial').classList.add('is-hidden')
        onMovieSelect(movie, document.querySelector('#right-summary'), 'right')
    }
});

// Set variables to hold information for comparison later
let leftMovie;
let rightMovie;

// Second request when user selects movie from drop down
const onMovieSelect = async (movie, summaryElement, side) => {
    const response = await axios.get('http://www.omdbapi.com/', {
        params: {
            apikey: "b4c1d05",
            i: movie.imdbID
        }
    });
    // Add HTML with the movie info
    summaryElement.innerHTML = movieTemplate(response.data);
    
    // Add data to variables for comparision
    side == "left" ? leftMovie = response.data : rightMovie = response.data;
    if (leftMovie && rightMovie) runComparison();
};

const runComparison = () => {
    // Grab all stats on each side
    const leftSideStats = document.querySelectorAll('#left-summary .notification')
    const rightSideStats = document.querySelectorAll('#right-summary .notification')

    // Loop through each and compare
    leftSideStats.forEach((leftStat, index) => {
        const rightStat = rightSideStats[index]
        
        // Reset colors if second search performed
        if (rightStat.classList.contains('is-warning')) rightStat.classList.replace('is-warning', 'is-primary')
        if (leftStat.classList.contains('is-warning')) leftStat.classList.replace('is-warning', 'is-primary')
    

        // Get data variables from data-value attr
        const leftSideValue = parseInt(leftStat.dataset.value)
        const rightSideValue = parseInt(rightStat.dataset.value)

        // Change color of each block to represent winner & loser
        if (rightSideValue > leftSideValue){
            leftStat.classList.remove('is-primary');
            leftStat.classList.add('is-warning');
        } else {
            rightStat.classList.remove('is-primary');
            rightStat.classList.add('is-warning');
        }
    });
}

// Helper function to create HTML for the movie information
const movieTemplate = (movieDetail) => {
    // Parse all movie numbers
    const dollars = parseInt(movieDetail.BoxOffice.replace(/\$/g, '').replace(/,/g,''));
    const metascore = parseInt(movieDetail.Metascore);
    const rating = parseFloat(movieDetail.imdbRating);
    const votes = parseInt(movieDetail.imdbVotes.replace(/,/g, ""));
    const awards = movieDetail.Awards.split(' ').reduce((prev, word) => {
        const value = parseInt(word);
        return isNaN(word) ? prev : prev += value
    }, 0)
    
    return `
        <article class="media">
            <figure class="media-left">
                <p class="image">
                <img src="${movieDetail.Poster}">
                </p>
            </figure>
            <div class="media-content">
                <div class="content">
                    <h1>${movieDetail.Title}</h1>
                    <h4>${movieDetail.Genre}</h4>
                    <p>${movieDetail.Plot}</p>
                </div>
            </div>
        </article>
        
        <article data-value="${awards}" class="notification is-primary">
            <p class="title">${movieDetail.Awards}</p>
            <p class="subtitle">Awards</p>
        </article>
        <article data-value="${dollars}" class="notification is-primary">
            <p class="title">${movieDetail.BoxOffice}</p>
            <p class="subtitle">Box Office</p>
        </article>
        <article data-value="${metascore}" class="notification is-primary">
            <p class="title">${movieDetail.Metascore}</p>
            <p class="subtitle">Metascore</p>
        </article>
        <article data-value="${rating}" class="notification is-primary">
            <p class="title">${movieDetail.imdbRating}</p>
            <p class="subtitle">IMDB Rating</p>
        </article>
        <article data-value="${votes}" class="notification is-primary">
            <p class="title">${movieDetail.imdbVotes}</p>
            <p class="subtitle">IMDB Votes</p>
        </article>
    `
};


