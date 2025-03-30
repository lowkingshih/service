require('dotenv').config()
const { execSync } = require('child_process')
const fs = require('fs')

const output = execSync(
  `npx supabase gen types typescript --project-id "${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_REF}" --schema public`,
  { encoding: 'utf8' }
)

const types = output
  .split('\n')
  .filter((line) => !line.includes('Selected project'))
  .join('\n')

fs.writeFileSync('database.types.ts', types)
