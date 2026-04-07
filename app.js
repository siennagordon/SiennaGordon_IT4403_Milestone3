// ==============================
// GLOBAL VARIABLES
// ==============================
let currentQuery = "";
let currentStartIndex = 0;
const RESULTS_PER_PAGE = 10;
const MAX_PAGES = 5;

// ==============================
// EVENT LISTENERS
// ==============================
$("#search-button").on("click", function () {
    currentQuery = $("#search-input").val().trim();
    currentStartIndex = 0;

    if (!currentQuery) {
    alert("Please enter a search term.");
    return;
}
});

// ==============================
// FETCH BOOKS (SEARCH)
// ==============================
function fetchBooks(query, startIndex) {
    const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=${query}&startIndex=${startIndex}&maxResults=10`;

    $("#results-container").html("<p>Loading...</p>");

    $.getJSON(apiUrl, function (response) {

        console.log(response); // 🔥 DEBUG LINE

        if (!response.items) {
            $("#results-container").html("<p>No results found.</p>");
            return;
        }

        renderBookResults(response.items);
        renderPagination();
    })
    .fail(function () {
        $("#results-container").html("<p>Error fetching data.</p>");
    });
}
}

// ==============================
// RENDER SEARCH RESULTS
// ==============================
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

// ==============================
// PAGINATION
// ==============================
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

// ==============================
// FETCH BOOK DETAILS
// ==============================
$(document).on("click", ".book-card", function () {
    const bookId = $(this).data("book-id");
    const apiUrl = `https://www.googleapis.com/books/v1/volumes/${bookId}`;

    $.getJSON(apiUrl, function (book) {
        displayBookDetails(book);
    });
});

// ==============================
// DISPLAY BOOK DETAILS
// ==============================
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

// ==============================
// LOAD FEATURED COLLECTION
// ==============================
function loadFeaturedBooks() {
    const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=bestsellers&maxResults=10`;

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

// Initialize collection on page load
$(document).ready(function () {
    loadFeaturedBooks();
});
