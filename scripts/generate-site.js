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

// const generateContent = recipes => `
//   <main>
//     ${recipes.map( group => `
//       <details>
//         <summary>${group.name}</summary>
//         ${group.recipes.map(generateRecipe).join('')}
//       </details>
//     `).join('')}
//   </main>`

// const generateRecipe = recipe => `
//   <details>
//     <summary>${recipe.name}</summary>
//     <ul>
//       ${recipe.steps.map( step => `
//         <li>${step}</li>
//       `).join('')}
//     </ul>
//   </details>`

const directoryContent = recipes => `
<h1>Karen Hansen's Recipes</h1>
<nav>
  <ul>
    ${Object.keys(recipes).map( category =>
      `<li><a href="./${category}/index.html">${category}</a></li>`
    ).join('\n')}
  </ul>
</nav>
`

const createDirectoryPage = async (recipes, template) => {
  await copyFile("./site-template/styles.css", "./docs/styles.css")

  let html = template
    .split("{{--TITLE--}}").join("Karen's Recipes")
    .split("{{--CONTENT--}}").join(directoryContent(recipes))

  await writeFile(`./docs/index.html`, html)
}

const categoryContent = (category, recipes) => `
<h1>Karen Hansen's Recipes</h1>
<h2>${category}</h2>
<nav>
  <ul>
    ${recipes[category].map( recipe =>
      `<li><a href="./${recipe.name}.html">${recipe.name}</a></li>`
    ).join('\n')}
  </ul>
</nav>
`

const createCategoryPage = async (category, recipes, template) => {
  await mkdir(`./docs/${category}`)
  await copyFile(`./site-template/styles.css`, `./docs/${category}/styles.css`)

  let html = template
    .split("{{--TITLE--}}").join(`Karen's ${category}`)
    .split("{{--CONTENT--}}").join(categoryContent(category, recipes))

  await writeFile(`./docs/${category}/index.html`, html)
}

const recipeContent = (recipe) => `
<h3>${recipe.name}</h3>
<main>
  <section>
    <ol>
      ${recipe.ingredients.map( ingredient =>
        `<li>${ingredient}</li>`
      ).join('\n')}
    </ol>
  </section>
  <section>
    <ul>
      ${recipe.instructions.map( instruction =>
        `<li>${instruction}</li>`
      ).join('\n')}
    </ul>
  </section>
</main>
`

const createRecipePage = async (recipe, category, template) => {
  let html = template
    .split("{{--TITLE--}}").join(recipe.name)
    .split("{{--CONTENT--}}").join(recipeContent(recipe))

  await writeFile(`./docs/${category}/${recipe.name}.html`, html)
}

const run = async () => {
  await rm('./docs', { recursive: true })
  await mkdir(`./docs`)
  let template = await readFile("./site-template/template.html", { encoding: "utf-8" })
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