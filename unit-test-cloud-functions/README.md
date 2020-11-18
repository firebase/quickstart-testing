# Unit Test Cloud Functions

This sample demonstrates how to write **unit tests** for Cloud Functions using
the `firebase-functions-test` SDK and the Emulator Suite.

## Setup

To install the dependencies for this sample run `npm install` inside the `functions` directory.
You will also need the [Firebase CLI](https://firebase.google.com/docs/cli).

## Run

To run the tests:

```
firebase emulators:exec --project=fakeproject 'npm run test'
```
