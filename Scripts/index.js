// Select DOM elements
const searchBar = document.querySelector(".search-bar");
const searchButton = document.querySelector(".search-btn");
const apiUrl = "https://api.spoonacular.com/recipes/";
const apikey = `&apiKey=a80afe252c0446159d837cabb170550f`;
const addrecipeInfo = `&addRecipeInformation=true`;
const checkboxes = document.querySelectorAll(".meal-type");
const history = document.querySelector(".search-history");
const date = new Date();

// Constants for recipe numbers
const SEARCH_RECIPES_NUMBER = 8;
const RAND_RECIPES_NUMBER = 4;

// Initialize variables to store recipe information and user selections
let randRecipes = [];
let searchRecipes = [];
let checkedTypes = new Set();
let searchValues = new Set();
let temp = new Set();
let searchValue = null;
let recipeId, viewButton;

// Determine if the search value is a name or ingredient based on input
function isNameOrIngredient(searchValue) {
  if (searchValue === "") {
    return "name";
  }
  if (searchValue !== "") {
    if (searchValue.split(",").length > 1) {
      return "ingredient";
    } else {
      return "name";
    }
  }
}

// Display recipes in the specified container
function displayRecipes(recipes, recipeContainer) {
  if (!recipes || !recipeContainer) {
    return;
  }
  // Clear previous recipes
  recipeContainer.innerHTML = "";
  // Create and append recipe cards
  recipes.forEach((recipe) => {
    const recipeCard = createRecipeCard(recipe);
    recipeContainer.appendChild(recipeCard);
  });
  // Add event listener to view buttons
  viewButton = document.querySelectorAll(".view");
  viewButton.forEach((button) => {
    button.addEventListener("click", (e) => {
      recipeId = e.target.id;
      // Store selected recipe ID for recipe page
      localStorage.storedRecipeId = recipeId;
    });
  });
}

// Display a not found message when no recipes are found
function notFound(recipeContainer) {
  recipeContainer.innerHTML = '<h4 class="no-recipes">No recipes found</h4>';
  localStorage.storedSearchRecipes = JSON.stringify([]);
}

// Store search value in local storage
function storeValue(value) {
  localStorage.searchValue = JSON.stringify(value);
}

// Store the current search value and manage the search history
function storeSearchValue(value) {
  if (searchValues.has(value)) {
    searchValues.delete(value);
  }
  searchValues.add(value);
  storeValue(value);
  localStorage.searchValues = JSON.stringify(Array.from(searchValues));
}

// Store bulk recipe information in local storage
function storeRecipesInfoBulk(RecipesInfoBulk) {
  localStorage.storedRecipesInfoBulk = JSON.stringify(RecipesInfoBulk);
}

// Fetch bulk recipe information based on IDs
function getRecipesInfoBulk(recipes) {
  const ids = recipes.map((recipe) => recipe.id);
  const url = `${apiUrl}informationBulk?ids=${ids.join(",")}${apikey}`;
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      storeRecipesInfoBulk(data);
    });
}

// Check if two sets are equal for checking if meal types have changed
function areSetsEqual(setA, setB) {
  if (setA.size !== setB.size) {
    return false;
  }
  for (let elem of setA) {
    if (!setB.has(elem)) {
      return false;
    }
  }
  return true;
}

// Fetch recipes from the API, either random or based on search
function getRecipes(number, isRandom) {
  let url, recipeContainer, recipes;
  if (isRandom) {
    // URL for fetching random recipes
    url = `${apiUrl}random?number=${number}${apikey}`;
    recipeContainer = document.querySelector("#recipes-random");
  } else {
    // Prevent fetching with the same parameters
    if (
      (searchBar.value === searchValue && areSetsEqual(checkedTypes, temp)) ||
      searchBar.value === ""
    ) {
      return;
    }
    // Update search history and parameters
    storeSearchValue(searchBar.value);
    searchValue = searchBar.value;
    if (localStorage.storedCheckedTypes) {
      temp = new Set(JSON.parse(localStorage.storedCheckedTypes));
      localStorage.storedCheckedTypes = JSON.stringify(
        Array.from(checkedTypes)
      );
    }
    // Construct URL for fetching based on search
    const numberAttr = `&number=${number}`;
    if (isNameOrIngredient(searchValue) === "name") {
      url = `${apiUrl}complexSearch?query=${searchValue}`;
    } else {
      url = `${apiUrl}complexSearch?includeIngredients=${searchValue}`;
    }
    url += numberAttr + apikey + addrecipeInfo;
    if (checkedTypes.size > 0) {
      url += `&type=${Array.from(checkedTypes).join(",")}`;
    }
    recipeContainer = document.querySelector("#recipes-search");
  }
  // Fetch and process recipes
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (isRandom) {
        recipes = data.recipes;
        randRecipes = recipes;
      } else {
        recipes = data.results;
        searchRecipes = recipes;
      }
      if (!recipes || recipes.length === 0) {
        notFound(recipeContainer);
        return;
      }
      displayRecipes(recipes, recipeContainer);
      if (isRandom) {
        localStorage.storedRandomRecipes = JSON.stringify(randRecipes);
      } else {
        localStorage.storedSearchRecipes = JSON.stringify(searchRecipes);
        getRecipesInfoBulk(recipes);
      }
    });
}

// Create a recipe card element
function createRecipeCard(recipe) {
  const recipeCard = document.createElement("div");
  recipeCard.classList.add("recipe-card");
  recipeCard.innerHTML = `
    <img class="recipe-img" src="${recipe.image}" alt="${recipe.title}" />
    <h4 class="recipe-name">${recipe.title}</h4>
    <a href="recipe.html">
      <button type="submit" class="view" id="${recipe.id}">View</button>
    </a>
    `;
  return recipeCard;
}

// Event listeners for searching
if (searchButton) {
  searchButton.addEventListener("click", () => {
    getRecipes(SEARCH_RECIPES_NUMBER, false);
  });
}
if (searchBar) {
  searchBar.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
      getRecipes(SEARCH_RECIPES_NUMBER, false);
    }
  });
}

// Event listeners for meal type checkboxes
checkboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    if (checkedTypes.has(checkbox.value)) {
      checkedTypes.delete(checkbox.value);
    } else {
      checkedTypes.add(checkbox.value);
    }
    // Update local storage and refetch recipes
    localStorage.storedCheckedTypes = JSON.stringify(Array.from(checkedTypes));
    getRecipes(SEARCH_RECIPES_NUMBER, false);
  });
});

// Store search term on blur and hide search history
searchBar.addEventListener("blur", () => {
  storeValue(searchBar.value);
  setTimeout(() => {    
    history.style.display = "none";
  }, 230);
});

// Display search history on focus
searchBar.addEventListener("focus", () => {
  if (localStorage.searchValues) {
    history.style.display = "block";
    searchValues = new Set(JSON.parse(localStorage.searchValues));
    history.innerHTML = "";
    for (let i = searchValues.size - 1; i >= 0; --i) {
      const value = Array.from(searchValues)[i];
      if (value === searchBar.value) {
        continue;
      }
      if (i < searchValues.size - 5) {
        break;
      }
      const searchValue = document.createElement("li");
      searchValue.textContent = value;
      history.appendChild(searchValue);
      searchValue.addEventListener("click", () => {
        searchBar.value = value;
        storeValue(value);
        getRecipes(SEARCH_RECIPES_NUMBER, false);
      });
    }
  }
});

window.onload = () => {
  // Redirect to landing page on first visit
  const hasVisited = localStorage.getItem("hasVisited");
  if (!hasVisited) {
    localStorage.setItem("hasVisited", "true");
    window.location.href = "landing.html";
  }
  // Restore previous search value
  if (searchBar.value === "" && localStorage.searchValue) {
    searchBar.value = JSON.parse(localStorage.searchValue);
  }
  searchBar.focus();
  // Restore previous meal type selections
  if (localStorage.storedCheckedTypes) {
    checkedTypes = new Set(JSON.parse(localStorage.storedCheckedTypes));
    temp = new Set(JSON.parse(localStorage.storedCheckedTypes));
    const checkboxes = document.querySelectorAll(".meal-type");
    checkboxes.forEach((checkbox) => {
      if (checkedTypes.has(checkbox.value)) {
        checkbox.checked = true;
      }
    });
  }
  // Restore previous recipes
  if (localStorage.storedSearchRecipes === "[]" && localStorage.searchValues) {
    notFound(document.querySelector("#recipes-search"));
  } else if (localStorage.storedSearchRecipes) {
    searchRecipes = JSON.parse(localStorage.storedSearchRecipes);
    displayRecipes(searchRecipes, document.querySelector("#recipes-search"));
  }
  if (localStorage.storedRandomRecipes) {
    randRecipes = JSON.parse(localStorage.storedRandomRecipes);
    displayRecipes(randRecipes, document.querySelector("#recipes-random"));
  } else {
    getRecipes(RAND_RECIPES_NUMBER, true);
  }
  if (localStorage.searchValues) {
    searchValues = new Set(JSON.parse(localStorage.searchValues));
  }
};

// Fetch random recipes on page load
getRecipes(RAND_RECIPES_NUMBER, true);

// Display current year in footer
document.querySelector("footer p span").textContent = date.getFullYear();
