/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const firebase = require("@firebase/rules-unit-testing");
const fs = require("fs");
const http = require("http");

/**
 * The emulator will accept any project ID for testing.
 */
const PROJECT_ID = "firestore-emulator-example";

/**
 * The FIRESTORE_EMULATOR_HOST environment variable is set automatically
 * by "firebase emulators:exec"
 */
const COVERAGE_URL = `http://${process.env.FIRESTORE_EMULATOR_HOST}/emulator/v1/projects/${PROJECT_ID}:ruleCoverage.html`;

/**
 * Creates a new client FirebaseApp with authentication and returns the Firestore instance.
 */
function getAuthedFirestore(auth) {
  return firebase
    .initializeTestApp({ projectId: PROJECT_ID, auth })
    .firestore();
}

beforeEach(async () => {
  // Clear the database between tests
  await firebase.clearFirestoreData({ projectId: PROJECT_ID });
});

before(async () => {
  // Load the rules file before the tests begin
  const rules = fs.readFileSync("firestore.rules", "utf8");
  await firebase.loadFirestoreRules({ projectId: PROJECT_ID, rules });
});

after(async () => {
  // Delete all the FirebaseApp instances created during testing
  // Note: this does not affect or clear any data
  await Promise.all(firebase.apps().map((app) => app.delete()));

  // Write the coverage report to a file
  const coverageFile = 'firestore-coverage.html';
  const fstream = fs.createWriteStream(coverageFile);
  await new Promise((resolve, reject) => {
      http.get(COVERAGE_URL, (res) => {
        res.pipe(fstream, { end: true });

        res.on("end", resolve);
        res.on("error", reject);
      });
  });

  console.log(`View firestore rule coverage information at ${coverageFile}\n`);
});

describe("My app", () => {
  it("require users to log in before creating a profile", async () => {
    const db = getAuthedFirestore(null);
    const profile = db.collection("users").doc("alice");
    await firebase.assertFails(profile.set({ birthday: "January 1" }));
  });

  it("should enforce the createdAt date in user profiles", async () => {
    const db = getAuthedFirestore({ uid: "alice" });
    const profile = db.collection("users").doc("alice");
    await firebase.assertFails(profile.set({ birthday: "January 1" }));
    await firebase.assertSucceeds(
      profile.set({
        birthday: "January 1",
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      })
    );
  });

  it("should only let users create their own profile", async () => {
    const db = getAuthedFirestore({ uid: "alice" });
    await firebase.assertSucceeds(
      db.collection("users").doc("alice").set({
        birthday: "January 1",
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      })
    );
    await firebase.assertFails(
      db.collection("users").doc("bob").set({
        birthday: "January 1",
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      })
    );
  });

  it("should let anyone read any profile", async () => {
    const db = getAuthedFirestore(null);
    const profile = db.collection("users").doc("alice");
    await firebase.assertSucceeds(profile.get());
  });

  it("should let anyone create a room", async () => {
    const db = getAuthedFirestore({ uid: "alice" });
    const room = db.collection("rooms").doc("firebase");
    await firebase.assertSucceeds(
      room.set({
        owner: "alice",
        topic: "All Things Firebase",
      })
    );
  });

  it("should force people to name themselves as room owner when creating a room", async () => {
    const db = getAuthedFirestore({ uid: "alice" });
    const room = db.collection("rooms").doc("firebase");
    await firebase.assertFails(
      room.set({
        owner: "scott",
        topic: "Firebase Rocks!",
      })
    );
  });

  it("should not let one user steal a room from another user", async () => {
    const alice = getAuthedFirestore({ uid: "alice" });
    const bob = getAuthedFirestore({ uid: "bob" });

    await firebase.assertSucceeds(
      bob.collection("rooms").doc("snow").set({
        owner: "bob",
        topic: "All Things Snowboarding",
      })
    );

    await firebase.assertFails(
      alice.collection("rooms").doc("snow").set({
        owner: "alice",
        topic: "skiing > snowboarding",
      })
    );
  });
});
