// Importing required modules
import express from "express"; // Express.js framework
import bodyParser from "body-parser"; // Middleware to parse request bodies
import pg from "pg"; // PostgreSQL client library

// Initializing Express application
const app = express();
const port = 3000; // Port number for the server

// Creating a new PostgreSQL client
const db = new pg.Client({
  user: "postgres", // Database username
  host: "localhost", // Database host
  database: "permalist", // Database name
  password: "INSERT_YOUR_PASSWORD", // Database password
  port: 5432, // Database port
});
db.connect(); // Connecting to the database

// Configuring middleware
app.use(bodyParser.urlencoded({ extended: true })); // Parsing URL-encoded bodies
app.use(express.static("public")); // Serving static files from the 'public' directory

// Initial list of items (This can be replaced by fetching items from the database)
let items = [
  { id: 1, title: "Buy chocolate" },
  { id: 2, title: "Finish homework" },
];

// Route to handle GET requests to the root URL
app.get("/", async (req, res) => {
  try {
    // Querying the database to fetch items
    const result = await db.query("SELECT * FROM items ORDER BY id ASC");
    items = result.rows; // Updating the items array with the fetched data

    // Rendering the index.ejs template with the listTitle and listItems
    res.render("index.ejs", {
      listTitle: "Today",
      listItems: items,
    });
  } catch (err) {
    console.log(err); // Logging any errors to the console
  }
});

// Route to handle POST requests to add a new item
app.post("/add", async (req, res) => {
  const item = req.body.newItem; // Extracting the new item from the request body
  try {
    // Inserting the new item into the database.
    //  the $1 is a parameterized query placeholder. When using parameterized queries, you replace values in the query with placeholders, and then provide the actual values separately.
    await db.query("INSERT INTO items (title) VALUES ($1)", [item]); // is the placeholder for the first parameter in the query.[item] is an array containing the actual value(s) that will be substituted into the query.
    res.redirect("/"); // Redirecting to the root URL
  } catch (err) {
    console.log(err); // Logging any errors to the console
  }
});

// Route to handle POST requests to edit an existing item
app.post("/edit", async (req, res) => {
  const item = req.body.updatedItemTitle; // Extracting the updated item title from the request body
  const id = req.body.updatedItemId; // Extracting the ID of the item to be updated

  try {
    // Updating the item in the database based on its ID
    await db.query("UPDATE items SET title = ($1) WHERE id = $2", [item, id]);
    res.redirect("/"); // Redirecting to the root URL
  } catch (err) {
    console.log(err); // Logging any errors to the console
  }
});

// Route to handle POST requests to delete an item
app.post("/delete", async (req, res) => {
  const id = req.body.deleteItemId; // Extracting the ID of the item to be deleted
  try {
    // Deleting the item from the database based on its ID
    await db.query("DELETE FROM items WHERE id = $1", [id]);
    res.redirect("/"); // Redirecting to the root URL
  } catch (err) {
    console.log(err); // Logging any errors to the console
  }
});

// Starting the server and listening on the specified port
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

