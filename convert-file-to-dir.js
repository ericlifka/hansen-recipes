const { rm, readdir, mkdir, readFile, writeFile } = require('node:fs/promises');

const getGroups = async () => {
  let files = await readdir("./raws")
  return files.map( f => f.split(".")[0] )
}

const getRecipeName = recipe =>
  recipe
    .split('\n')[0]
    .trim()
    .replaceAll(/[\,\.\(\)\'\/]/g, '')
    .replaceAll(/ +/g, '_')

const processGroup = async group => {
  await mkdir(`./recipes/${group}`)
  let recipe_text = await readFile(`./raws/${group}.txt`, { encoding: "utf-8" })
  let recipes = recipe_text.split("\n\n")
  for (let recipe of recipes) {
    await writeFile(`./recipes/${group}/${getRecipeName(recipe)}.txt`, recipe, { flag: "wx" })
  }
}

const run = async () => {
  await rm('./recipes', { recursive: true })
  await mkdir(`./recipes`)
  let groups = await getGroups()

  for (let group of groups)
    await processGroup(group)
}

run()