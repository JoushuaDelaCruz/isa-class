const http = require("http");
const jwt = require("./jwt.js");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  // if you run the client from sth like file:///C:/nodejs/10httonlyCookie1/index.html
  // it would mean HTML file is being served via the file:// protocol directly from your filesystem rather than over HTTP or HTTPS.
  console.log("Request origin:", req.headers.origin);
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://ubiquitous-taffy-4e6ba3.netlify.app"
  ); // Adjust the port if necessary
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") {
    // Preflight request automatically sends by browser for many reasons
    res.writeHead(204); //success with no content to return to the client
    res.end();
    return;
  }

  /*\ /login */
  if (req.url === "/login" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString(); // convert Buffer to string
    });
    req.on("end", () => {
      try {
        const { username, password } = JSON.parse(body); // Parse the JSON body
        // Change password to length of 6
        console.log(process.env.USERNAME, process.env.PASSWORD);
        if (
          username === process.env.SERVER_USERNAME &&
          password === process.env.SERVER_PASSWORD
        ) {
          const payload = {
            username: username,
            password: password,
            treasure: process.env.TREASURE,
          };
          jwt.login(payload).then((token) => {
            res.writeHead(200, {
              "Set-Cookie": `token=${token}; HttpOnly; SameSite=Lax; Secure; Max-Age=60`,
              "Content-Type": "application/json",
            });
            res.end(JSON.stringify({ message: "Logged in successfully" }));
          });
        } else {
          res.writeHead(401, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "Unauthorized" }));
        }
      } catch (e) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Bad Request: Invalid JSON" }));
      }
    });
    /*\ /something */
  } else if (req.url === "/something" && req.method === "GET") {
    cookieParser()(req, res, () => {
      const token = req.cookies.token;
      jwt.verify(token).then((verification) => {
        if (verification.is_valid) {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              message: `You are logged in, treasure:${verification.user.treasure}`,
            })
          );
        } else {
          res.writeHead(401, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ message: "Unauthorized: You are not logged in." })
          );
        }
      });
    }); // Parse the cookies
    // Check if the user is logged in by checking the cookie
  } else {
    // For any other route, return 404 not found
    res.writeHead(404, { "Content-Type": "text/html" });
    res.end("404 Not Found");
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); //**  Generated mostly by chatGPT ver. 4 **/
