set -e

npm i @nrwl/nx-linux-x64-gnu
npm install
# npx lerna bootstrap

npx firebase --project=fakeproject emulators:exec 'npm run test'