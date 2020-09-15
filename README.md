# Firebase Testing Quickstarts

A collection of quickstart samples demonstrating testing patterns for Firebase services.

The repository is broken up by testing strategy:

  * **[Unit testing security rules](unit-test-security-rules/README.md)** - 
  write unit tests for your Realtime Database and Cloud Firestore security
  rules using `mocha` and the `@firebase/rules-unit-testing` library.
  * **[Unit testing Cloud Functions](unit-test-cloud-functions/README.md)** -
  write unit tests for your Cloud Functions usiing the `firebase-functions-test` SDK.
  * **[Connect your app to the Emulator Suite](manual-emulator-testing/README.md)** -
  connect the Firebase SDKs in your app directly to the local emulators and manually
  test your app.

## How to make contributions?

Please read and follow the steps in the [CONTRIBUTING.md](CONTRIBUTING.md)

## License
See [LICENSE](LICENSE)

## Build Status

[![Actions Status][gh-actions-badge]][gh-actions]

[gh-actions]: https://github.com/firebase/quickstart-testing/actions
[gh-actions-badge]: https://github.com/firebase/quickstart-testing/workflows/CI%20Tests/badge.svg
