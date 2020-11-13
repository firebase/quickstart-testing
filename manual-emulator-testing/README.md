# Manual testing using the Emulator Suite

This directory contains a very basic web app that connects to the
Cloud Firestore and Firebase Authentication emulators. 

You sign in and read and write data in a completely local environment.

## Setup

To install the dependencies for this sample run `npm install` inside this directory.
You will also need the [Firebase CLI](https://firebase.google.com/docs/cli).

## Run

First start the emulators:

```
firebase --project=fakeproject emulators:start 
```

Next visit `http://localhost:5000` in your browser and you should see a 
_very_ barebones chat app powered by the Cloud Firestore and Firebase 
Authentication emulators. Try adding some messages and then click the link
at the bottom of the UI to view the messages in the Emulator UI.
