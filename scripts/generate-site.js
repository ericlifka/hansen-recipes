const { copyFile, readdir, readFile, writeFile } = require('node:fs/promises')

const loadRecipes = async () => {
  let recipes = [ ]

  for (let group of await readdir("./recipes")) {
    let recipe_group = { name: group, recipes: [] }
    
    for (let recipe of await readdir(`./recipes/${group}`)) {
      let contents = await readFile(`./recipes/${group}/${recipe}`, { encoding: "utf-8" })
      let [name, ...steps] = contents.split('\n')

      recipe_group.recipes.push({ name, steps })
    }

    recipes.push(recipe_group)
  }

  return recipes
}

const generateContent = recipes => `
  <main>
    ${recipes.map( group => `
      <details>
        <summary>${group.name}</summary>
        ${group.recipes.map(generateRecipe).join('')}
      </details>
    `).join('')}
  </main>`

const generateRecipe = recipe => `
  <details>
    <summary>${recipe.name}</summary>
    <ul>
      ${recipe.steps.map( step => `
        <li>${step}</li>
      `).join('')}
    </ul>
  </details>`

const run = async () => {
  await copyFile("./site-template/script.js", "./docs/script.js")
  await copyFile("./site-template/style.css", "./docs/style.css")

  let html_template = await readFile("./site-template/index.html", { encoding: "utf-8" })
  let [head, foot] = html_template.split("{{--CONTENT--}}")
  let content = generateContent(await loadRecipes())
  let html = [head, content, foot].join('\n')

  await writeFile(`./docs/index.html`, html)
}

run()
