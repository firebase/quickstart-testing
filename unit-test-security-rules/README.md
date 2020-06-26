# Unit Test Security Rules

This sample demonstrates how to write **unit tests** for security rules
using the Firebase Emulator Suite.

## Setup

To install the dependencies for this sample run `npm install` inside this directory.
You will also need the [Firebase CLI](https://firebase.google.com/docs/cli).

## Run

To run the Realtime Database tests:

```
firebase emulators:exec --only database "npm run test-database"
```

To run the Cloud Firestore tests:

```
firebase emulators:exec --only firestore "npm run test-firestore"
```
