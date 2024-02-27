const apiKey = "a80afe252c0446159d837cabb170550f";
const searchBar = document.querySelector(".search-bar");
const searchButton = document.querySelector(".search-btn");
const apiUrl = "https://api.spoonacular.com/recipes/";

function getCheckedTypes() {
  const checkedTypes = [];
  const checkboxes = document.querySelectorAll(".meal-type");
  checkboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      checkedTypes.push(checkbox.value);
    }
  });
  return checkedTypes;
}

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

function getRecipes(number, isRandom) {
  let url, recipeContainer, checkedTypes, recipes;
  if (isRandom) {
    url = `${apiUrl}random?number=${number}&apiKey=${apiKey}`;
    recipeContainer = document.querySelector("#recipes-random");
  } else {
    checkedTypes = getCheckedTypes();
    if (isNameOrIngredient(searchBar.value) === "name") {
      url = `${apiUrl}complexSearch?number=${number}&apiKey=${apiKey}&query=${
        searchBar.value
      }&type=${checkedTypes.join(",")}`;
    }
    if (isNameOrIngredient(searchBar.value) === "ingredient") {
      url = `${apiUrl}findByIngredients?apiKey=${apiKey}
              &ingredients=${searchBar.value}&number=${number}`;
    }
    recipeContainer = document.querySelector("#recipes-search");
  }
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (isRandom) {
        recipes = data.recipes;
      } else if (isNameOrIngredient(searchBar.value) === "name") {
        recipes = data.results;
      } else {
        recipes = data;
      }
      recipeContainer.innerHTML = "";
      if (!recipes || recipes.length === 0) {
        recipeContainer.innerHTML =
          '<h4 class="no-recipes">No recipes found</h4>';
      } else {
        recipes.forEach((recipe, i) => {
          const recipeCard = createRecipeCard(recipe, i);
          recipeContainer.appendChild(recipeCard);
          return recipes;
        });
      }
    });
}

function createRecipeCard(recipe) {
  const recipeCard = document.createElement("div");
  recipeCard.classList.add("recipe-card");
  recipeCard.innerHTML = `
		<img class="recipe-img" src="${recipe.image}" alt="${recipe.title}" />
		<h4 class="recipe-name">${recipe.title}</h4>
    <a href="recipe.html" target="_blank">
      <button type="submit" id="${recipe.id}">View</button>
    </a>
	`;
  return recipeCard;
}

let randRecipes = getRecipes(4, true);
searchButton.addEventListener("click", () => {
  let resultsRecipes = getRecipes(8, false);
});
