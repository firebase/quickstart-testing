set -e

npm install --no-optional
# npx lerna bootstrap

npx firebase --project=fakeproject emulators:exec 'npm run test'