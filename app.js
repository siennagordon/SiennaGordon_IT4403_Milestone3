const API_KEY = "AIzaSyA8E-AiV7BriCfag6TJIfu0aaQgTfbHQVY";
let currentQuery = "";
let currentStartIndex = 0;
const RESULTS_PER_PAGE = 10;
const MAX_PAGES = 5;


$("#search-button").on("click", function () {
    console.log("CLICK WORKS");

    const inputValue = $("#search-input").val();

    if (!inputValue) {
        alert("Enter a search term");
        return;
    }

    const query = inputValue.trim();
    fetchBooks(query, 0);
});

function fetchBooks(query, startIndex = 0) {
    const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&startIndex=${startIndex}&maxResults=10&key=${API_KEY}`;
    
    console.log("Fetching:", apiUrl);
    
    $.getJSON(apiUrl)
        .done(function(response) {
            console.log("API Response:", response);

            if (!response.items || response.items.length === 0) {
                $("#results-container").html("<p>No results found.</p>");
                return;
            }

            $("#results-container").empty();
            response.items.forEach(function(book) {
                const info = book.volumeInfo;
                const title = info.title || "No title";
                const thumbnail = info.imageLinks?.thumbnail || "";
                $("#results-container").append(`
                    <div class="book-card" data-id="${book.id}">
                        <h3>${title}</h3>
                        <img src="${thumbnail}" alt="${title}">
                    </div>
                `);
            });

            // Simple pagination
            $("#pagination-container").html("");
            for (let i = 0; i < Math.min(5, Math.ceil(response.totalItems / 10)); i++) {
                $("#pagination-container").append(`
                    <button class="pagination-button" data-start-index="${i * 10}">${i + 1}</button>
                `);
            }
        })
        .fail(function(error) {
            console.error("API error:", error);
            $("#results-container").html("<p>Failed to fetch results.</p>");
        });
}

function renderBookResults(books) {
    $("#results-container").empty();

    books.forEach(function (book) {
        const volumeInfo = book.volumeInfo;

        const title = volumeInfo.title || "No Title Available";
        const thumbnail = volumeInfo.imageLinks?.thumbnail || "";

        const bookCard = `
            <div class="book-card" data-book-id="${book.id}">
                <h3 class="book-title">${title}</h3>
                <img class="book-image" src="${thumbnail}" alt="${title}">
            </div>
        `;

        $("#results-container").append(bookCard);
    });
}


function renderPagination() {
    $("#pagination-container").empty();

    for (let page = 0; page < MAX_PAGES; page++) {
        const startIndex = page * RESULTS_PER_PAGE;

        const button = `
            <button class="pagination-button" data-start-index="${startIndex}">
                ${page + 1}
            </button>
        `;

        $("#pagination-container").append(button);
    }
}

// Handle pagination click
$(document).on("click", ".pagination-button", function () {
    currentStartIndex = $(this).data("start-index");
    fetchBooks(currentQuery, currentStartIndex);
});


$(document).on("click", ".book-card", function () {
    console.log("Book clicked"); // DEBUG

    const bookId = $(this).data("book-id");

    const apiUrl = `https://www.googleapis.com/books/v1/volumes/${bookId}`;

    $.getJSON(apiUrl, function (book) {
        const info = book.volumeInfo;

        const title = info.title || "No Title";
        const authors = info.authors ? info.authors.join(", ") : "Unknown Author";
        const description = info.description || "No description available.";

        $("#details-container").html(`
            <h2>${title}</h2>
            <p><strong>Author(s):</strong> ${authors}</p>
            <p>${description}</p>
        `);
    });
});


function displayBookDetails(book) {
    const volumeInfo = book.volumeInfo;

    const title = volumeInfo.title || "No Title";
    const authors = volumeInfo.authors ? volumeInfo.authors.join(", ") : "Unknown Author";
    const description = volumeInfo.description || "No description available.";

    const detailsHTML = `
        <h2>${title}</h2>
        <p><strong>Author(s):</strong> ${authors}</p>
        <p>${description}</p>
    `;

    $("#details-container").html(detailsHTML);
}


function loadFeaturedBooks() {
    const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=bestsellers&maxResults=10&key=${API_KEY}`;

    $.getJSON(apiUrl, function (response) {
        if (!response.items) return;

        response.items.forEach(function (book) {
            const volumeInfo = book.volumeInfo;

            const title = volumeInfo.title || "No Title";
            const thumbnail = volumeInfo.imageLinks?.thumbnail || "";

            const bookCard = `
                <div class="book-card" data-book-id="${book.id}">
                    <h3 class="book-title">${title}</h3>
                    <img class="book-image" src="${thumbnail}" alt="${title}">
                </div>
            `;

            $("#collection-container").append(bookCard);
        });
    });
}

$(document).ready(function () {
    loadFeaturedBooks();
});

