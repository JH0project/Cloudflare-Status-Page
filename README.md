# Cloudflare-Status-Page
A website monitoring and status page application design to be deploy on cloudflare at no cost
![image](https://github.com/JH0project/Cloudflare-Status-Page/assets/48591478/e16d12eb-1985-423f-b2f5-1af6695e3aec)

## Installing

### Website
1. Fork this repo
2. Go to Cloudflare Workers& Pages, Create an application, Pages, Connect to Git
3. Choose that repo
4. Change setting Build settings
    - Framework preset: `Next.js`
    - Build command: `cp .yarnrc.yml site && cp yarn.lock site && node ./scripts/removeLocalDeps.js && cd site && yarn install --immutable=false --mode=update-lockfile && npx @cloudflare/next-on-pages@1`
    - Build output directory: `/site/.vercel/output/static`

   Environment variables (advanced)
    - NODE_VERSION `18`
5. Create and deploy
6. Go to Settings, Functions, Compatibility flags add `nodejs_compat`

Monitoring app
- Messure website response time at different locations
- Cloudflare Worker
- Cloudflare KV store

Status/Performance website
- Cloudflare Pages

Inspired by https://github.com/eidam/cf-workers-status-page
