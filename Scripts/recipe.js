const recipeImg = document.createElement("img");
const recipeName = document.createElement("h2");
const recipeDiv = document.querySelector(".recipe-head");
const recipeDescriptionDiv = document.querySelector(".recipe-description");
const recipeIngredients = document.querySelector(".ingredients");
const recipeEquipments = document.querySelector(".equipments");
const recipeInstructions = document.querySelector(".instructions");

let randRecipes = [];
let searchRecipes = [];
let recipeId = JSON.parse(localStorage.storedRecipeId);
let recipe;
let ingredients = new Set();

function findRecipe(recipeArray) {
  for (let i = 0; i < recipeArray.length; ++i) {
    if (recipeArray[i].id === recipeId) {
      return recipeArray[i];
    }
  }
  return null;
}

function getIngredients() {
  const apiKey = "a80afe252c0446159d837cabb170550f";
  url = `https://api.spoonacular.com/recipes/informationBulk?apiKey=${apiKey}&ids=${recipeId}`;
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      for (let i = 0; i < data[0].extendedIngredients.length; ++i) {
        ingredients.add(data[0].extendedIngredients[i].original);
      }
      displayRecipeInfo();
    });
}

function displayRecipeInfo() {
  const uniqueEquipments = new Set();
  for (let i = 0; i < recipe.analyzedInstructions.length; ++i) {
    const steps = recipe.analyzedInstructions[i].steps;
    for (let j = 0; j < steps.length; ++j) {
      const instructionLi = document.createElement("li");
      instructionLi.textContent = steps[j].step;
      recipeInstructions.appendChild(instructionLi);
      steps[j].equipment.forEach((equipment) =>
        uniqueEquipments.add(equipment.name)
      );
    }
  }
  ingredients.forEach((ingredient) => {
    const ingredientLi = document.createElement("li");
    ingredientLi.textContent = ingredient;
    recipeIngredients.appendChild(ingredientLi);
  });
  uniqueEquipments.forEach((equipment) => {
    const equipmentLi = document.createElement("li");
    equipmentLi.textContent = equipment;
    recipeEquipments.appendChild(equipmentLi);
  });
}

if (localStorage.storedRandomRecipes) {
  randRecipes = JSON.parse(localStorage.storedRandomRecipes);
}
if (localStorage.storedSearchRecipes) {
  searchRecipes = JSON.parse(localStorage.storedSearchRecipes);
}

recipe = findRecipe(randRecipes);
if (recipe === null) {
  recipe = findRecipe(searchRecipes);
}

recipeName.textContent = recipe.title;
recipeImg.src = recipe.image;
recipeImg.alt = recipe.title;
recipeDiv.prepend(recipeName);
recipeDiv.prepend(recipeImg);

getIngredients();