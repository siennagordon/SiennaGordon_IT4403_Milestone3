let currentQuery = "";
const RESULTS_PER_PAGE = 10;
const MAX_PAGES = 5;


// =====================
// SEARCH
// =====================
$("#search-button").on("click", function () {

    const inputValue = $("#search-input").val();

    if (!inputValue || inputValue.trim() === "") {
        alert("Enter a search term");
        return;
    }

    const query = inputValue.trim();
    currentQuery = query;

    fetchBooks(query, 0);
});


// =====================
// FETCH BOOKS
// =====================
function fetchBooks(query, startIndex = 0) {

    const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&startIndex=${startIndex}&maxResults=${RESULTS_PER_PAGE}`;

    $("#results-container").html("<p>Loading...</p>");

    $.getJSON(apiUrl)
        .done(function (response) {

            if (!response.items) {
                $("#results-container").html("<p>No results found.</p>");
                return;
            }

            renderResults(response.items);
            renderPagination(response.totalItems);
        })
        .fail(function () {
            $("#results-container").html("<p>Failed to fetch data.</p>");
        });
}


// =====================
// RENDER RESULTS (GRID)
// =====================
function renderResults(books) {

    $("#results-container").empty();

    books.forEach(function (book) {

        const info = book.volumeInfo;

        const title = info.title || "No Title";
        const thumbnail = info.imageLinks?.thumbnail
            ? info.imageLinks.thumbnail.replace("http://", "https://")
            : "https://via.placeholder.com/150x200?text=No+Image";

        $("#results-container").append(`
            <div class="book-card" data-book-id="${book.id}">
                <img src="${thumbnail}">
                <h3>${title}</h3>
            </div>
        `);
    });
}


// =====================
// PAGINATION
// =====================
function renderPagination(totalItems) {

    $("#pagination-container").empty();

    const totalPages = Math.min(MAX_PAGES, Math.ceil(totalItems / RESULTS_PER_PAGE));

    for (let i = 0; i < totalPages; i++) {

        const startIndex = i * RESULTS_PER_PAGE;

        $("#pagination-container").append(`
            <button class="page-btn" data-start="${startIndex}">
                ${i + 1}
            </button>
        `);
    }
}


// =====================
// PAGINATION CLICK
// =====================
$(document).on("click", ".page-btn", function () {

    const startIndex = $(this).data("start");
    fetchBooks(currentQuery, startIndex);
});


// =====================
// BOOK DETAILS
// =====================
$(document).on("click", ".book-card", function () {

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


// =====================
// FEATURED COLLECTION
// =====================
function loadFeaturedBooks() {

    const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=bestsellers&maxResults=10`;

    $.getJSON(apiUrl, function (response) {

        if (!response.items) return;

        response.items.forEach(function (book) {

            const info = book.volumeInfo;

            const title = info.title || "No Title";
            const thumbnail = info.imageLinks?.thumbnail
                ? info.imageLinks.thumbnail.replace("http://", "https://")
                : "https://via.placeholder.com/150x200?text=No+Image";

            $("#collection-container").append(`
                <div class="book-card" data-book-id="${book.id}">
                    <img src="${thumbnail}">
                    <h3>${title}</h3>
                </div>
            `);
        });
    });
}


// =====================
// INITIAL LOAD
// =====================
$(document).ready(function () {
    loadFeaturedBooks();
});
