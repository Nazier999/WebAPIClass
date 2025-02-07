const mongoose = require("mongoose");

//Setup Mongoose Schema
const favoriteSchema = new mongoose.Schema({
    FavoriteThing:String
});

const Favorite = mongoose.model("Favorite", favoriteSchema, "Favorites");

module.exports = Favorite;