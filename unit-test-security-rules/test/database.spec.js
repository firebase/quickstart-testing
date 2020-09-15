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
const http = require("http");
const fs = require("fs");

/**
 * The emulator will accept any database name for testing.
 */
const DATABASE_NAME = "database-emulator-example";

/**
 * The FIREBASE_DATABASE_EMULATOR_HOST environment variable is set automatically
 * by "firebase emulators:exec"
 */
const COVERAGE_URL = `http://${process.env.FIREBASE_DATABASE_EMULATOR_HOST}/.inspect/coverage?ns=${DATABASE_NAME}`;

/**
 * Creates a new client FirebaseApp with authentication and returns the Database instance.
 */
function getAuthedDatabase(auth) {
  return firebase
    .initializeTestApp({ databaseName: DATABASE_NAME, auth })
    .database();
}

/**
 * Creates a new admin FirebaseApp and returns the Database instance.
 */
function getAdminDatabase() {
  return firebase
    .initializeAdminApp({ databaseName: DATABASE_NAME })
    .database();
}

before(async () => {
  // Set database rules before running these tests
  const rules = fs.readFileSync("database.rules.json", "utf8");
  await firebase.loadDatabaseRules({
    databaseName: DATABASE_NAME,
    rules: rules,
  });
});

beforeEach(async () => {
  // Clear the database between tests
  await getAdminDatabase().ref().set(null);
});

after(async () => {
  // Close any open apps
  await Promise.all(firebase.apps().map((app) => app.delete()));

  // Write the coverage report to a file
  const coverageFile = 'database-coverage.html';
  const fstream = fs.createWriteStream(coverageFile);
  await new Promise((resolve, reject) => {
      http.get(COVERAGE_URL, (res) => {
        res.pipe(fstream, { end: true });

        res.on("end", resolve);
        res.on("error", reject);
      });
  });

  console.log(`View database rule coverage information at ${coverageFile}\n`);
});

describe("profile read rules", () => {
  it("should allow anyone to read profiles", async () => {
    const alice = getAuthedDatabase({ uid: "alice" });
    const bob = getAuthedDatabase({ uid: "bob" });
    const noone = getAuthedDatabase(null);

    await getAdminDatabase().ref("users/alice").set({
      name: "Alice",
      profilePicture: "http://cool_photos/alice.jpg",
    });

    await firebase.assertSucceeds(alice.ref("users/alice").once("value"));
    await firebase.assertSucceeds(bob.ref("users/alice").once("value"));
    await firebase.assertSucceeds(noone.ref("users/alice").once("value"));
  });

  it("should only allow users to modify their own profiles", async () => {
    const alice = getAuthedDatabase({ uid: "alice" });
    const bob = getAuthedDatabase({ uid: "bob" });
    const noone = getAuthedDatabase(null);

    await firebase.assertSucceeds(
      alice.ref("users/alice").update({
        favorite_color: "blue",
      })
    );
    await firebase.assertFails(
      bob.ref("users/alice").update({
        favorite_color: "red",
      })
    );
    await firebase.assertFails(
      noone.ref("users/alice").update({
        favorite_color: "orange",
      })
    );
  });
});

describe("room creation", () => {
  it("should require the user creating a room to be its owner", async () => {
    const alice = getAuthedDatabase({ uid: "alice" });

    // should not be able to create room owned by another user
    await firebase.assertFails(alice.ref("rooms/room1").set({ owner: "bob" }));
    // should not be able to create room with no owner
    await firebase.assertFails(
      alice.ref("rooms/room1").set({ members: { alice: true } })
    );
    // alice should be allowed to create a room she owns
    await firebase.assertSucceeds(
      alice.ref("rooms/room1").set({ owner: "alice" })
    );
  });
});

describe("room members", () => {
  it("must be added by the room owner", async () => {
    const ownerId = "room_owner";
    const owner = getAuthedDatabase({ uid: ownerId });
    await owner.ref("rooms/room2").set({ owner: ownerId });

    const aliceId = "alice";
    const alice = getAuthedDatabase({ uid: aliceId });
    // alice cannot add random people to a room
    await firebase.assertFails(
      alice.ref("rooms/room2/members/rando").set(true)
    );
    // alice cannot add herself to a room
    await firebase.assertFails(
      alice.ref("rooms/room2/members/alice").set(true)
    );
    // the owner can add alice to a room
    await firebase.assertSucceeds(
      owner.ref("rooms/room2/members/alice").set(true)
    );
  });
});
