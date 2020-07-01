set -e

npm install
npx lerna bootstrap

npx firebase --project=fakeproject emulators:exec 'npm run test'