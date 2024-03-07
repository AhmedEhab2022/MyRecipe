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
let ingredients = [];

function findRecipe(recipeArray) {
  for (let i = 0; i < recipeArray.length; ++i) {
    if (recipeArray[i].id === recipeId) {
      return recipeArray[i];
    }
  }
  return null;
}

function getStoredExtendedIngredients() {
  if (recipe.extendedIngredients) {
    ingredients = recipe.extendedIngredients.map(
      (ingredient) => ingredient.original
    );
  } else if (localStorage.storedRecipesInfoBulk) {
    const storedRecipesInfoBulk = JSON.parse(
      localStorage.storedRecipesInfoBulk
    );
    storedRecipesInfoBulk.forEach((recipeInfo) => {
      if (recipeInfo.id === recipeId) {
        ingredients = recipeInfo.extendedIngredients.map(
          (ingredient) => ingredient.original
        );
        return;
      }
    });
  }
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
  getStoredExtendedIngredients();
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
  document.querySelector(
    ".time"
  ).innerHTML = `Ready in: ${recipe.readyInMinutes} minutes<br/><br/>Servings: ${recipe.servings}`;
  for (let i = 0; i < recipe.dishTypes.length; ++i) {
    const dishTypeLi = document.createElement("li");
    dishTypeLi.textContent = recipe.dishTypes[i];
    document.querySelector(".dish-types").appendChild(dishTypeLi);
  }
  for (let i = 0; i < recipe.cuisines.length; ++i) {
    const cuisineLi = document.createElement("li");
    cuisineLi.textContent = recipe.cuisines[i];
    document.querySelector(".cuisines").appendChild(cuisineLi);
  }
  for (let i = 0; i < recipe.diets.length; ++i) {
    const dietLi = document.createElement("li");
    dietLi.textContent = recipe.diets[i];
    document.querySelector(".diets").appendChild(dietLi);
  }
  document.querySelector('.health').textContent = `Health Score: ${recipe.healthScore}`;
  document.querySelector(".summary").innerHTML = recipe.summary.replace(
    /<a\b[^>]*>(.*?)<\/a>/g,
    "$1"
  );
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

displayRecipeInfo();
