const { expect } = require("chai");
const admin = require("firebase-admin");

// Initialize the firebase-functions-test SDK using environment variables.
// These variables are automatically set by firebase emulators:exec
//
// This configuration will be used to initialize the Firebase Admin SDK, so
// when we use the Admin SDK in the tests below we can be confident it will
// communicate with the emulators, not production.
const test = require("firebase-functions-test")({
  projectId: process.env.GCLOUD_PROJECT,
});

// Import the exported function definitions from our functions/index.js file
const myFunctions = require("../index");

describe("Unit tests", () => {
  after(() => {
    test.cleanup();
  });

  it("tests a simple HTTP function", (done) => {
    // A fake request object, with req.query.text set to 'input'
    const req = { query: { text: "input" } };

    // A fake response object, with a stubbed send() function which asserts that it is called
    // with the right result
    const res = {
      send: (text) => {
        expect(text).to.eq(`text: input`);
        done();
      },
    };

    // Invoke function with our fake request and response objects. This will cause the
    // assertions in the response object to be evaluated.
    myFunctions.simpleHttp(req, res);
  });

  it("tests a simple callable function", async () => {
    const wrapped = test.wrap(myFunctions.simpleCallable);

    const data = {
      a: 1,
      b: 2,
    };

    // Call the wrapped function with data and context
    const result = await wrapped(data);

    // Check that the result looks like we expected.
    expect(result).to.eql({
      c: 3,
    });
  });

  it("tests a Cloud Firestore function", async () => {
    const wrapped = test.wrap(myFunctions.firestoreUppercase);

    // Make a fake document snapshot to pass to the function
    const after = test.firestore.makeDocumentSnapshot(
      {
        text: "hello world",
      },
      "/collection/foo"
    );

    // Call the function
    await wrapped(after);

    // Check the data in the Firestore emulator
    const snap = await admin.firestore().doc("/uppercase/foo").get();
    expect(snap.data()).to.eql({
      text: "HELLO WORLD",
    });
  }).timeout(5000);
});
