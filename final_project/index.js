const express = require("express");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const customer_routes = require("./router/auth_users.js").authenticated;
const genl_routes = require("./router/general.js").general;

const app = express();

app.use(express.json());

app.use(
  "/customer",
  session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true,
  })
);

app.use("/customer/auth/*", function auth(req, res, next) {
  // Check if user is authenticated
  if (req.session && req.session.token) {
    try {
      // Verify the JWT token
      jwt.verify(
        req.session.token,
        "767a038225b23b73702d702b83cb6d6e3ea0ffb9f6fd0755c929af5e33630257fca3f17195822473bd544cf648493b243f2977447057097db1b682e2a0d43d72",
        (err, decoded) => {
          if (err) {
            // Invalid token, clear session and redirect to login
            req.session.destroy();
            return res.status(401).json({ message: "Unauthorized" });
          } else {
            // User is authenticated, proceed to next middleware
            next();
          }
        }
      );
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    // No session token, redirect to login
    return res.status(401).json({ message: "Unauthorized" });
  }
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));
