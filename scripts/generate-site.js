const { copyFile, readdir, readFile, writeFile, rm, mkdir } = require('node:fs/promises')

const noDotFile = name => name[0] != '.'
const getGroups = async () => (await readdir("./recipes-json")).filter(noDotFile)
const getRecipes = async group => (await readdir(`./recipes-json/${group}`)).filter(noDotFile)

const loadRecipes = async () => {
  let recipes = { }

  for (let group of await getGroups()) {
    recipes[group] = []
    
    for (let recipe of await getRecipes(group))
      recipes[group].push(JSON.parse(await readFile(`./recipes-json/${group}/${recipe}`, { encoding: "utf-8" })))
  }

  return recipes
}

const directoryContent = recipes => `
<h1>Karen's Recipes</h1>
<nav>
  <ul class="category-list">
    ${Object.keys(recipes).map( category => `
      <a href="./recipes/${category}.html">
        <li class="category-link" data-category="${category}">${category}</li>
      </a>
    `).join('\n')}
  </ul>
</nav>
`

const createDirectoryPage = async (recipes, template) => {
  let html = template
    .split("{{--TITLE--}}").join("Karen's Recipes")
    .split("{{--STYLES--}}").join("./static/styles.css")
    .split("{{--CONTENT--}}").join(directoryContent(recipes))

  await writeFile(`./docs/index.html`, html)
}

const categoryContent = (category, recipes) => `
<h1>${category}</h1>
<nav>
  <ul class="recipe-list">
    ${recipes[category].map( recipe => `
      <a href="./${category}/${recipe.name}.html">
        <li class="recipe-link">${recipe.name}</li>
      </a>
    `).join('\n')}
  </ul>
</nav>
`

const createCategoryPage = async (category, recipes, template) => {
  await mkdir(`./docs/recipes/${category}`)
  let html = template
    .split("{{--TITLE--}}").join(`Karen's ${category}`)
    .split("{{--STYLES--}}").join("../static/styles.css")
    .split("{{--CONTENT--}}").join(categoryContent(category, recipes))

  await writeFile(`./docs/recipes/${category}.html`, html)
}

const recipeContent = (recipe) => `
<h3>${recipe.name}</h3>
<main class="recipe-card">
  <section class="ingredients">
    <ol>
      ${recipe.ingredients.map( ingredient => `
        <li>${ingredient}</li>
      `).join('\n')}
    </ol>
  </section>
  <section class="instructions">
    <ul>
      ${recipe.instructions.map( instruction => `
        <li>${instruction}</li>
      `).join('\n')}
    </ul>
  </section>
</main>
`

const createRecipePage = async (recipe, category, template) => {
  let html = template
    .split("{{--TITLE--}}").join(recipe.name)
    .split("{{--STYLES--}}").join("../../static/styles.css")
    .split("{{--CONTENT--}}").join(recipeContent(recipe))

  await writeFile(`./docs/recipes/${category}/${recipe.name}.html`, html)
}

const run = async () => {
  await rm('./docs/recipes', { recursive: true })
  await mkdir(`./docs/recipes`)
  let template = await readFile("./site-template.html", { encoding: "utf-8" })
  let recipes = await loadRecipes()

  createDirectoryPage(recipes, template)
  for (let category of Object.keys(recipes)) {
    await createCategoryPage(category, recipes, template)

    for (let recipe of recipes[category]) {
      await createRecipePage(recipe, category, template)
    }
  }
}

run()