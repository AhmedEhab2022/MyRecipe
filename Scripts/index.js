const searchBar = document.querySelector(".search-bar");
const searchButton = document.querySelector(".search-btn");
const apiUrl = "https://api.spoonacular.com/recipes/";
const apikey = `&apiKey=a80afe252c0446159d837cabb170550f`;
const addrecipeInfo = `&addRecipeInformation=true`;
const checkboxes = document.querySelectorAll(".meal-type");
const history = document.querySelector(".search-history");
const date = new Date();
const SEARCH_RECIPES_NUMBER = 8;
const RAND_RECIPES_NUMBER = 4;

let randRecipes = [];
let searchRecipes = [];
let checkedTypes = new Set();
let searchValues = new Set();
let temp = new Set();
let searchValue = null;
let recipeId, viewButton;

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

function displayRecipes(recipes, recipeContainer) {
  if (!recipes || !recipeContainer) {
    return;
  }
  recipeContainer.innerHTML = "";
  recipes.forEach((recipe) => {
    const recipeCard = createRecipeCard(recipe);
    recipeContainer.appendChild(recipeCard);
  });
  viewButton = document.querySelectorAll(".view");
  viewButton.forEach((button) => {
    button.addEventListener("click", (e) => {
      recipeId = e.target.id;
      localStorage.storedRecipeId = recipeId;
    });
  });
}

function notFound(recipeContainer) {
  recipeContainer.innerHTML = '<h4 class="no-recipes">No recipes found</h4>';
  localStorage.storedSearchRecipes = JSON.stringify([]);
}

function storeValue(value) {
  localStorage.searchValue = JSON.stringify(value);
}

function storeSearchValue(value) {
  if (searchValues.has(value)) {
    searchValues.delete(value);
  }
  searchValues.add(value);
  storeValue(value);
  localStorage.searchValues = JSON.stringify(Array.from(searchValues));
}

function storeRecipesInfoBulk(RecipesInfoBulk) {
  localStorage.storedRecipesInfoBulk = JSON.stringify(RecipesInfoBulk);
}

function getRecipesInfoBulk(recipes) {
  const ids = recipes.map((recipe) => recipe.id);
  const url = `${apiUrl}informationBulk?ids=${ids.join(",")}${apikey}`;
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      storeRecipesInfoBulk(data);
    });
}

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

function getRecipes(number, isRandom) {
  let url, recipeContainer, recipes;
  if (isRandom) {
    url = `${apiUrl}random?number=${number}${apikey}`;
    recipeContainer = document.querySelector("#recipes-random");
  } else {
    if (
      (searchBar.value === searchValue && areSetsEqual(checkedTypes, temp)) ||
      searchBar.value === ""
    ) {
      return;
    }
    storeSearchValue(searchBar.value);
    searchValue = searchBar.value;
    if (localStorage.storedCheckedTypes) {
      temp = new Set(JSON.parse(localStorage.storedCheckedTypes));
      localStorage.storedCheckedTypes = JSON.stringify(
        Array.from(checkedTypes)
      );
    }
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

checkboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    if (checkedTypes.has(checkbox.value)) {
      checkedTypes.delete(checkbox.value);
    } else {
      checkedTypes.add(checkbox.value);
    }
    localStorage.storedCheckedTypes = JSON.stringify(Array.from(checkedTypes));
    getRecipes(SEARCH_RECIPES_NUMBER, false);
  });
});

searchBar.addEventListener("blur", () => {
  storeValue(searchBar.value);
  setTimeout(() => {    
    history.style.display = "none";
  }, 230);
});

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
  const hasVisited = localStorage.getItem("hasVisited");
  if (!hasVisited) {
    localStorage.setItem("hasVisited", "true");
    window.location.href = "landing.html";
  }
  if (searchBar.value === "" && localStorage.searchValue) {
    searchBar.value = JSON.parse(localStorage.searchValue);
  }
  searchBar.focus();
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

//getRecipes(RAND_RECIPES_NUMBER, true);

document.querySelector("footer p span").textContent = date.getFullYear();
