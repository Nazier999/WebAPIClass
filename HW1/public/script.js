const userContainer = document.getElementById("favorites-container");
let isLoggedIn = false; // Default to not logged in

// Fetch user status
const fetchUserStatus = async () => {
    try {
        const response = await fetch("/user-status");
        if (!response.ok) throw new Error("Failed to fetch user status");

        const data = await response.json();
        isLoggedIn = data.loggedIn;
    } catch (error) {
        console.error("Error fetching user status:", error);
    }
};

const fetchFavorites = async () => {
    try {
        const response = await fetch("/favorites");
        if (!response.ok) {
            throw new Error("Failed to get favorites");
        }

        const favorites = await response.json();
        userContainer.innerHTML = "";

        favorites.forEach((favorite) => {
            const userDiv = document.createElement("div");
            userDiv.className = "Favorite";
            userDiv.innerHTML = `
                <li>${favorite.FavoriteThing}</li>
                ${
                    isLoggedIn
                        ? `
                            <button onclick="updateFavorite('${favorite._id}', '${favorite.FavoriteThing}')">Update</button>
                            <button onclick="deleteFavorite('${favorite._id}')">Delete</button>
                        `
                        : ""
                }
            `;
            userContainer.appendChild(userDiv);
        });
    } catch (error) {
        console.error("Error: ", error);
        userContainer.innerHTML = "<p style='color:red'>Failed to get favorites</p>";
    }
};

const updateFavorite = (id) => {
    window.location.href = `update.html?id=${id}`;
};

const deleteFavorite = async (id) => {
    if (!confirm("Are you sure you want to delete this favorite?")) return;

    try {
        const response = await fetch(`/favorites/${id}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            throw new Error("Failed to delete favorite");
        }

        fetchFavorites();
    } catch (error) {
        console.error("Error deleting favorite:", error);
    }
};

// Initialize
const init = async () => {
    await fetchUserStatus(); // Fetch the login status first
    fetchFavorites(); // Then fetch the favorites
};

init();
