const { rm, readdir, mkdir, readFile, writeFile } = require('node:fs/promises');

const notDotFile = name => name[0] != '.'
const getGroups = async () => (await readdir("./recipes-text")).filter(notDotFile)
const getRecipes = async group => (await readdir(`./recipes-text/${group}`)).filter(notDotFile)

const sanitizeIngredient = ingredient => ingredient
  .trim()
  .replaceAll(/ t\. /g, ' tsp ')
  .replaceAll(/ T\. /g, ' Tbsp ')
  .replaceAll(/ c\. /g, ' cups ')

const sanitizeInstruction = instruction => instruction
  .trim()

const processGroup = async group => {
  await mkdir(`./recipes-json/${group}`)
  let recipes = (await getRecipes(group)).map( f => f.split(".")[0] )
  for (let recipe of recipes) {
    let text = await readFile(`./recipes-text/${group}/${recipe}.txt`, { encoding: "utf-8" })
    let [ name, ingredients, ...instructions ] = text.split('\n\n')
    let json = {
      name: name.trim(),
      ingredients: ingredients.split('\n').map(sanitizeIngredient),
      instructions: instructions.join('\n').split('\n').map(sanitizeInstruction),
    }
    await writeFile(`./recipes-json/${group}/${recipe}.json`, JSON.stringify(json, null, 2), { flag: "wx" })
  }
}

const run = async () => {
  await rm('./recipes-json', { recursive: true })
  await mkdir(`./recipes-json`)
  for (let group of await getGroups())
    await processGroup(group)
}

run()