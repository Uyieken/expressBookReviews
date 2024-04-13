const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();
const usersData = require("./usersData.js");

let users = [];

const isValid = (username) => {
  //returns boolean
  //write code to check is the username is valid
};

// Function to authenticate user
const authenticateUser = (username, password) => {
  // Write code to check if username and password match the records
  const user = usersData.find((user) => user.username === username);
  return user && user.password === password;
};

// Login for Registered Users
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  // Authenticate user
  if (authenticateUser(username, password)) {
    // Create JWT token
    const token = jwt.sign(
      { username },
      "767a038225b23b73702d702b83cb6d6e3ea0ffb9f6fd0755c929af5e33630257fca3f17195822473bd544cf648493b243f2977447057097db1b682e2a0d43d72",
      {
        expiresIn: "1h",
      }
    );
    return res.status(200).json({ token });
  } else {
    return res.status(401).json({ message: "Invalid username or password" });
  }
});

// Add a book review

// Function to find a review by user and ISBN
const findReview = (isbn, searchUsername) => {
  // Find the book by ISBN
  const foundBook = Object.values(books).find((book) => book.isbn === isbn);

  // If book is not found, return null
  if (!foundBook) {
    return null;
  }

  // Get the reviews of the found book
  const bookReviews = foundBook.reviews;

  // Loop through the reviews to find the one with the matching username
  for (const review of bookReviews) {
    if (review.username === searchUsername) {
      return review;
    }
  }

  // If no review is found for the provided username, return null
  return null;
};

// Add or Modify a book review
// Add or Modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body;
  console.log(review.rating, review.comment);

  // Check if review and ISBN are provided
  if (!review || !isbn) {
    return res.status(400).json({ message: "Review and ISBN are required" });
  }

  // Check if user is logged in (authenticated)
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkhlbnJ5IiwiaWF0IjoxNzEzMDI5NzIxLCJleHAiOjE3MTMwMzMzMjF9.7QoqxKxouQs7JrUn6TS6jDypGlzlp12NJlx447IIETE";
  if (!token) {
    return res.status(401).json({ message: "Unauthorized, please log in" });
  }

  try {
    // Verify JWT token to get the username
    const decoded = jwt.verify(
      token,
      "767a038225b23b73702d702b83cb6d6e3ea0ffb9f6fd0755c929af5e33630257fca3f17195822473bd544cf648493b243f2977447057097db1b682e2a0d43d72"
    );
    const username = decoded.username;

    // Find the existing review for the user and ISBN
    const existingReview = findReview(isbn, username);

    if (existingReview) {
      // Modify existing review

      existingReview.rating = review.rating;
      existingReview.comment = review.comment;
      return res.status(200).json({
        username: username,
        rating: review.rating,
        comment: review.comment,
      });
    } else {
      // Add new review
      const book = books[isbn];
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }

      book.reviews.push({
        username: username,
        rating: review.rating,
        comment: review.comment,
      });
      return res.status(200).json({ message: "Review added successfully" });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Delete a book review
// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  console.log(isbn);

  // Check if user is logged in (authenticated)
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkhlbnJ5IiwiaWF0IjoxNzEzMDQ0MDI5LCJleHAiOjE3MTMwNDc2Mjl9.4HUy2YZI2UdxCpvVI1nh88NnBVzAdv2XREhcLF_UAlw";

  if (!token) {
    return res.status(401).json({ message: "Unauthorized, please log in" });
  }

  try {
    // Verify JWT token to get the username
    const decoded = jwt.verify(
      token,
      "767a038225b23b73702d702b83cb6d6e3ea0ffb9f6fd0755c929af5e33630257fca3f17195822473bd544cf648493b243f2977447057097db1b682e2a0d43d72"
    );
    const username = decoded.username;

    // Find the book by ISBN
    const foundBook = Object.values(books).find((book) => book.isbn === isbn);

    // If book is not found, return error
    if (!foundBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Get the reviews of the found book
    const bookReviews = foundBook.reviews;

    // Check if the user has a review for the provided ISBN
    let reviewIndex = -1;
    for (let i = 0; i < bookReviews.length; i++) {
      if (bookReviews[i].username === username) {
        reviewIndex = i;
        break;
      }
    }

    if (reviewIndex !== -1) {
      // Delete the user's review
      bookReviews.splice(reviewIndex, 1);
      return res.status(200).json({ message: "Review deleted successfully" });
    } else {
      // User does not have a review for the provided ISBN
      return res.status(404).json({ message: "Review not found" });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
