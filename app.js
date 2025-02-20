require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const FavoriteThings = require("./HW1/models/favorite");
const User = require("./HW1/models/users");
const { register } = require("module");

const app = express();
const port = process.env.port || 3000;


/*// MongoDB connection setup
const mongoURI = "mongodb://localhost:27017/crudapp";
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error"));
db.once("open", () => {
  console.log("Connected to MongoDB Database");
});

//random junk to save the repo

*/
// Middleware to serve static files
app.use(express.static(path.join(__dirname, "public")));

// Middleware to parse JSON requests
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

//sets up the session variable
app.use(session({
  secret:process.env.SESSION_SECRET,
  resave:false,
  saveUninitialized:false,
  cookie:{secure:false}// Set to true is using https
}));

// Authentication middleware
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }
  return res.redirect("/login");
}

//MongoDB connection setup
const mongoURI = process.env.MONGODB_URI;//"mongodb://localhost:27017/crudapp";
mongoose.connect(mongoURI);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error"));
db.once("open", ()=>{
    console.log("Connected to MongoDB Database");
});

// Routes
app.get("/register", (req,res)=>{
    res.sendFile(path.join(__dirname, "HW1", "register.html"));
})

app.post("/register", async (req,res)=>{
    try{
        const {username, password} = req.body;

        const existingUser = await User.findOne({username});

        if(existingUser){
            return res.send("Username already taken. Try a different one")
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        const newUser = new User({username, password:hashedPassword});
        await newUser.save();

        res.redirect("/login");

    }catch(err){
        res.status(500).send("Error registering new user.");
    }
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "HW1", "Index.html"));
});



app.get("/delete", (req, res) => {
    res.sendFile(path.join(__dirname, "HW1", "delete.html"));
});

app.get("/addfavorite", (req, res) => {
    res.sendFile(path.join(__dirname, "HW1", "addfavorite.html"));
});

app.get("/login",(req,res)=>{
    res.sendFile(path.join(__dirname  + "/HW1/login.html"));
})

app.get("/users",isAuthenticated, (req,res)=>{
    res.sendFile(path.join(__dirname, "HW1", "favorites.html"));
});

// Get all favorites
app.get("/favorites", async (req, res) => {
    try {
        const favorites = await Favorite.find();
        res.json(favorites);
    } catch (err) {
        res.status(500).json({ error: "Failed to get favorites." });
    }
});

// User status route to check if the user is logged in
app.get("/user-status", (req, res) => {
    if (req.session.user) {
        res.json({ loggedIn: true, user: req.session.user });
    } else {
        res.json({ loggedIn: false });
    }
});


// Get a favorite by ID
app.get("/favorites/:id", async (req, res) => {
    try {
        const favorite = await Favorite.findById(req.params.id);
        if (!favorite) {
            return res.status(404).json({ error: "Favorite not found" });
        }
        res.json(favorite);
    } catch (err) {
        res.status(500).json({ error: "Failed to get favorite." });
    }
});

// Add a new favorite
app.post("/favorites", async (req, res) => {
    try {
        console.log("Received data:", req.body); // Debugging line

        if (!req.body.FavoriteThing) {
            return res.status(400).json({ error: "FavoriteThing is required." });
        }

        const newFavorite = new Favorite(req.body);
        const savedFavorite = await newFavorite.save();
        res.status(201).json(savedFavorite);
    } catch (err) {
        console.error("Error saving favorite:", err);
        res.status(500).json({ error: "Failed to add new favorite." });
    }
});

//Create routes
app.post("/addperson", async (req, res)=>{
    try{
        const newPerson = new Person(req.body);
        const savePerson = await newPerson.save();
        //res.status(201).json(savePerson);
        res.redirect("/users");
        console.log(savePerson);
    }catch(err){
        res.status(501).json({error:"Failed to add new person."});
    }
});

app.post("/login", async (req,res)=>{
    const {username, password} = req.body;
    console.log(req.body);

    const user = await User.findOne({username});

    if(user && bcrypt.compareSync(password, user.password)){
        req.session.user = username;
        return res.redirect("/users");
    }
    req.session.error = "Invalid User";
    return res.redirect("/login")
});

app.get("/logout", (req,res)=>{
    req.session.destroy(()=>{
        res.redirect("/login");
    })
});
// Update an existing favorite
app.put("/favorites/:id", async (req, res) => {
    try {
        const updatedFavorite = await Favorite.findByIdAndUpdate(
            req.params.id,
            { FavoriteThing: req.body.FavoriteThing },
            { new: true, runValidators: true }
        );
        if (!updatedFavorite) {
            return res.status(404).json({ error: "Favorite not found" });
        }
        res.json(updatedFavorite);
    } catch (err) {
        res.status(400).json({ error: "Failed to update the favorite." });
    }
});

// Delete a favorite by ID
app.delete("/favorites/:id", async (req, res) => {
    try {
        const deletedFavorite = await Favorite.findByIdAndDelete(req.params.id);

        if (!deletedFavorite) {
            return res.status(404).json({ error: "Favorite not found" });
        }

        res.json({ message: "Favorite deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete favorite." });
    }
});



// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


module.exports = app;