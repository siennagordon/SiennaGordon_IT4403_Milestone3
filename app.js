const API_KEY = "AIzaSyA8E-AiV7BriCfag6TJIfu0aaQgTfbHQVY";
let currentQuery = "";
let currentStartIndex = 0;
const RESULTS_PER_PAGE = 10;
const MAX_PAGES = 5;


$("#search-button").on("click", function () {
    const inputValue = $("#search-input").val();

    console.log("Input value:", inputValue); // DEBUG

    if (!inputValue || inputValue.trim() === "") {
        alert("Please enter a search term.");
        return;
    }

    const query = inputValue.trim();
    fetchBooks(query, 0);
});

function fetchBooks(query, startIndex) {

    if (!query) {
        $("#results-container").html("<p>Please enter a search term.</p>");
        return;
    }

    const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&startIndex=${startIndex}&maxResults=10`;

    console.log("Fetching:", apiUrl);

    $.getJSON(apiUrl)
        .done(function (response) {
            console.log(response);

            if (!response.items) {
                $("#results-container").html("<p>No results found.</p>");
                return;
            }

            $("#results-container").empty();

            response.items.forEach(function (book) {
                const info = book.volumeInfo;

                $("#results-container").append(`
                    <div>
                        <h3>${info.title}</h3>
                    </div>
                `);
            });
        })
        .fail(function () {
            $("#results-container").html("<p>Error fetching data.</p>");
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
    const bookId = $(this).data("book-id");
    const apiUrl = `https://www.googleapis.com/books/v1/volumes/${bookId}`;

    $.getJSON(apiUrl, function (book) {
        displayBookDetails(book);
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

