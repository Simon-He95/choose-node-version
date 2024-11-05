import { search } from '@inquirer/prompts'
import { jsShell } from 'lazy-js-utils'
import pc from 'picocolors'
import 'core-js/actual/array/find-last-index'

// todo: support windows nvm
async function run() {
  const { result: current, status: currentStatus } = await jsShell(`fnm current`, { stdio: 'pipe' })
  if (currentStatus !== 0)
    throw new Error('Failed to get current node version')
  const { result, status } = await jsShell(`fnm ls`, { stdio: 'pipe' })
  if (status !== 0)
    throw new Error('Failed to list node versions')
  const options = result.split('\n').map((v) => {
    const name = v.replace(/\*\s+/, '').trim().replace(/\s*default/, '')
    if (name === 'system')
      return undefined
    if (name === current) {
      return {
        name: `* ${name}`,
        value: name.replace('v', ''),
        description: 'current node version',
      }
    }

    return {
      name,
      value: name.replace('v', ''),
      description: '',
    }
  }).filter(Boolean) as { name: string, value: string, description: string }[]

  const answer = await search({
    message: 'Select an npm package',
    source: async (input) => {
      if (!input) {
        return options
      }

      return options
      // const results = fuzzy.filter(input, options, {
      //   extract: ({ name }) => name,
      // }) || []
      // // Sort results based on exact match, position of the match, and length of the match
      // results.sort((a, b) => {
      //   if (a.score === b.score) {
      //     const indexA = a.string.indexOf(input)
      //     const indexB = b.string.indexOf(input)
      //     return indexA - indexB
      //   }
      //   return b.score - a.score
      // })

      // return results.map(r => r.original)
    },
  }).catch((err) => {
    // eslint-disable-next-line no-console
    console.log(pc.redBright(err.message))
  })
  if (answer) {
    jsShell(`fnm use ${answer}`)
  }
}

run()
