const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const usersData = require("./usersData.js");

// Register a new user
public_users.post("/register", (req, res) => {
  try {
    // Extract username and password from request body
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    // Check if the username already exists
    if (users[username]) {
      return res.status(409).json({ message: "Username already exists" });
    }

    // Register the new user
    users[username] = password;

    // Update array in another file
    usersData.push({ username, password });
    const dataFilePath = path.join(__dirname, "usersData.js");
    fs.writeFileSync(
      dataFilePath,
      `module.exports = ${JSON.stringify(usersData, null, 2)}`,
      "utf8"
    );

    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get the book list available in the shop
// Function to fetch the list of books available in the shop using Axios and Promises
const getBookList = () => {
  return new Promise((resolve, reject) => {
    axios
      .get("http://api.example.com/books")
      .then((response) => {
        resolve(response.data.books);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

// Get the book list available in the shop using async-await
public_users.get("/", async (req, res) => {
  try {
    const bookList = await getBookList();
    return res.status(200).json({ books: bookList });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get book details based on ISBN

// Function to fetch book details based on ISBN using Axios and Promises
const getBookDetails = (isbn) => {
  return new Promise((resolve, reject) => {
    axios
      .get(`http://api.example.com/book/isbn/${isbn}`)
      .then((response) => {
        resolve(response.data.book);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

// Get book details based on ISBN using async-await
public_users.get("/isbn/:isbn", async (req, res) => {
  try {
    // Extract ISBN from request parameters
    const isbn = req.params.isbn;

    // Fetch book details based on ISBN from the external API using async-await
    const book = await getBookDetails(isbn);

    // Check if the book with the given ISBN exists
    if (book) {
      return res.status(200).json({ book });
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Function to fetch books by author using Axios and Promises
const getBooksByAuthor = (author) => {
  return new Promise((resolve, reject) => {
    axios
      .get(`http://api.example.com/books/author/${author}`)
      .then((response) => {
        resolve(response.data.books);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

// Get book details based on author using async-await
public_users.get("/author/:author", async (req, res) => {
  try {
    // Extract author from request parameters
    const author = req.params.author;

    // Fetch books by author from the external API using async-await
    const booksByAuthor = await getBooksByAuthor(author);

    // Check if any books are found for the given author
    if (booksByAuthor.length > 0) {
      return res.status(200).json({ books: booksByAuthor });
    } else {
      return res.status(404).json({ message: "No books found for the author" });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Function to fetch books by title using Axios and Promises
const getBooksByTitle = (title) => {
  return new Promise((resolve, reject) => {
    axios
      .get(`http://api.example.com/books/title/${title}`)
      .then((response) => {
        resolve(response.data.books);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

// Get book details based on title using async-await
public_users.get("/title/:title", async (req, res) => {
  try {
    const title = req.params.title;

    // Fetch books by title from the external API using async-await
    const booksByTitle = await getBooksByTitle(title);

    if (booksByTitle.length > 0) {
      return res.status(200).json({ books: booksByTitle });
    } else {
      return res.status(404).json({ message: "No books found with the title" });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get book review
public_users.get("/review/:isbn", function (req, res) {
  try {
    // Extract ISBN from request parameters
    const isbn = req.params.isbn;
    const book = Object.values(books).find((book) => book.isbn === isbn);
    // Check if the book exists in the database
    if (book) {
      const bookReviews = book.reviews;

      return res.status(200).json({ reviews: bookReviews });
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports.general = public_users;
