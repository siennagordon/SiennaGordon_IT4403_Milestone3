const API_KEY = "AIzaSyA8E-AiV7BriCfag6TJIfu0aaQgTfbHQVY";
let currentQuery = "";
let currentStartIndex = 0;
const RESULTS_PER_PAGE = 10;
const MAX_PAGES = 5;
$("#grid-view").click(function () {
    $("#results-container").removeClass("list-view").addClass("grid-view");
});

$("#list-view").click(function () {
    $("#results-container").removeClass("grid-view").addClass("list-view");
});

$("#search-button").on("click", function () {

    const inputValue = $("#search-input").val();

    if (!inputValue || inputValue.trim() === "") {
        alert("Enter a search term");
        return;
    }

    const query = inputValue.trim();
    fetchBooks(query, 0);
});

function fetchBooks(query, startIndex = 0) {

    if (!query || query.trim() === "") {
        $("#results-container").html("<p>Please enter a search term.</p>");
        return;
    }

    currentQuery = query; // ✅ FIX: store query for pagination

    const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&startIndex=${startIndex}&maxResults=10`;

    console.log("Fetching:", apiUrl);

    $.getJSON(apiUrl)
        .done(function(response) {

            if (!response.items || response.items.length === 0) {
                $("#results-container").html("<p>No results found.</p>");
                return;
            }

            $("#results-container").empty();

            response.items.forEach(function(book) {
                const info = book.volumeInfo;
                const title = info.title || "No title";

                let thumbnail = "https://via.placeholder.com/150x200?text=No+Image";
                if (info.imageLinks && info.imageLinks.thumbnail) {
                    thumbnail = info.imageLinks.thumbnail.replace("http://", "https://");
                }

                $("#results-container").append(`
                    <div class="book-card" data-book-id="${book.id}">
                        <h3>${title}</h3>
                        <img src="${thumbnail}" alt="${title}">
                    </div>
                `);
            });

            renderPagination();
        })
        .fail(function() {
            $("#results-container").html("<p>Failed to fetch results.</p>");
        });
}

function renderBookResults(books) {
    const template = $("#book-template").html();
    $("#results-container").empty();

    books.forEach(function (book) {
        const info = book.volumeInfo;

        const data = {
            id: book.id,
            title: info.title || "No Title",
            thumbnail: info.imageLinks?.thumbnail
                ? info.imageLinks.thumbnail.replace("http://", "https://")
                : "https://via.placeholder.com/150x200?text=No+Image"
        };

        const html = Mustache.render(template, data);
        $("#results-container").append(html);
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

    if (!bookId) {
        alert("Book ID missing!");
        return;
    }

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
    const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=bestsellers&maxResults=10`;

    $.getJSON(apiUrl, function (response) {
        if (!response.items) return;

        $("#collection-container").empty();

        response.items.forEach(function (book) {
            const info = book.volumeInfo;

            const title = info.title || "No Title";

            let thumbnail = "https://via.placeholder.com/150x200?text=No+Image";
            if (info.imageLinks && info.imageLinks.thumbnail) {
                thumbnail = info.imageLinks.thumbnail.replace("http://", "https://");
            }

            $("#collection-container").append(`
                <div class="book-card" data-book-id="${book.id}">
                    <h3>${title}</h3>
                    <img src="${thumbnail}">
                </div>
            `);
        });
    });
}

$(document).ready(function () {
    loadFeaturedBooks();
});

