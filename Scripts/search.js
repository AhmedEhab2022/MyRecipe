const apiKey = "a5c2682fb2b44465b49ce2725e3ea775";
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

function getRandRecipes() {
  const url = `${apiUrl}random?number=5&apiKey=${apiKey}`;
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      const recipes = data.recipes;
      const recipeContainer = document.querySelector("#recipes-random");
      recipeContainer.innerHTML = "";
      recipes.forEach((recipe) => {
        const recipeCard = createRecipeCard(recipe);
        recipeContainer.appendChild(recipeCard);
      });
    });
}

function createRecipeCard(recipe) {
  const recipeCard = document.createElement("div");
  recipeCard.classList.add("recipe-card");
  recipeCard.innerHTML = `
		<img class="recipe-img" src="${recipe.image}" alt="${recipe.title}" />
		<h4>${recipe.title}</h4>
		<button type="submit" id="${recipe.id}">View</button>
	`;
  return recipeCard;
}

getRandRecipes();
