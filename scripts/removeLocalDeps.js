import fs from 'fs'

const packageJson = JSON.parse(fs.readFileSync('./site/package.json', 'utf-8'))
delete packageJson.devDependencies['cf-status-page-types']
fs.writeFileSync('./site/package.json', JSON.stringify(packageJson, undefined, 2))