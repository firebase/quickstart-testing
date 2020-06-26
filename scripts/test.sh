set -e

npm install
npx lerna bootstrap
npx lerna run test:ci