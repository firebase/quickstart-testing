set -e

npm install
npx lerna bootstrap

firebase --project=fakeproject emulators:exec 'npm run test'