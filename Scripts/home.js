const apiKey = 'a80afe252c0446159d837cabb170550f';
const searchBar = document.querySelector('.search-bar');
const searchButton = document.querySelector('.search-btn');
const apiUrl = 'https://api.spoonacular.com/recipes/';

let randRecipes = [];
let searchRecipes = [];
let searchValue = '';

function getCheckedTypes() {
	const checkedTypes = [];
	const checkboxes = document.querySelectorAll('.meal-type');
	checkboxes.forEach((checkbox) => {
		if (checkbox.checked) {
			checkedTypes.push(checkbox.value);
		}
		});
		return checkedTypes;
}

function isNameOrIngredient(searchValue) {
	if (searchValue === '') {
		return 'name';
	}
	if (searchValue !== '') {
		if (searchValue.split(',').length > 1) {
			return 'ingredient';
		} else {
			return 'name';
		}
	}
}

function getRecipes(number, isRandom) {
	let url, recipeContainer, checkedTypes, recipes;
	if (isRandom) {
		url = `${apiUrl}random?number=${number}&apiKey=${apiKey}`;
		recipeContainer = document.querySelector('#recipes-random');
	} else {
		if (searchBar.value === searchValue) {
			return;
		}
		searchValue = searchBar.value;
		checkedTypes = getCheckedTypes();
		const number = `&number=${number}`;
		const apikey = `&apiKey=${apiKey}`;
		const addrecipeInfo = `&addRecipeInformation=true`;
		if (isNameOrIngredient(searchValue) === 'name') {
			url = `${apiUrl}complexSearch?query=${searchValue}`;
		} else {
			url = `${apiUrl}complexSearch?includeIngredients=${searchValue}`;
		}
		url += number + apikey + addrecipeInfo;
		if (checkedTypes.length > 0) {
			url += `&type=${checkedTypes.join(',')}`;
		}
		recipeContainer = document.querySelector('#recipes-search');
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
			recipeContainer.innerHTML = '';
			if (!recipes || recipes.length === 0) {
				recipeContainer.innerHTML =
					'<h4 class="no-recipes">No recipes found</h4>';
			} else {
				recipes.forEach((recipe) => {
					const recipeCard = createRecipeCard(recipe);
					recipeContainer.appendChild(recipeCard);
				});
			}
		});
}

function createRecipeCard(recipe) {
	const recipeCard = document.createElement('div');
	recipeCard.classList.add('recipe-card');
	recipeCard.innerHTML = `
		<img class="recipe-img" src="${recipe.image}" alt="${recipe.title}" />
		<h4 class="recipe-name">${recipe.title}</h4>
		<a href="recipe.html" target="_blank">
			<button type="submit" id="${recipe.id}">View</button>
		</a>
	`;
	return recipeCard;
}

getRecipes(4, true);
searchButton.addEventListener('click', () => {
	getRecipes(8, false);
});
searchBar.addEventListener('keyup', (e) => {
	if (e.key === 'Enter') {
		getRecipes(8, false);
	}
});
