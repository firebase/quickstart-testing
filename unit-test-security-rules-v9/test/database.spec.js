/**
 * Copyright 2021 Google LLC
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
const { readFileSync, createWriteStream } = require('fs');
const http = require('http');

const testing = require('@firebase/rules-unit-testing');
const { initializeTestEnvironment, assertFails, assertSucceeds } = testing;

const { ref, get, update } = require('firebase/database');

/** @type testing.RulesTestEnvironment */
let testEnv;
/** @type testing.RulesTestContext */
let unauthedDb;
/** @type testing.RulesTestContext */
let aliceDb;
/** @type testing.RulesTestContext */
let bobDb;

before(async () => {
  testEnv = await initializeTestEnvironment({
    database: {rules: readFileSync('database.rules.json', 'utf8')},
  });
});

after(async () => {
  await testEnv.cleanup();

  // Write the coverage report to a file
  const coverageFile = 'database-coverage.html';
  const fstream = createWriteStream(coverageFile);
  await new Promise((resolve, reject) => {
    const { host, port } = testEnv.emulators.database;
    const quotedHost = host.includes(':') ? `[${host}]` : host;
    http.get(`http://${quotedHost}:${port}/.inspect/coverage?ns=${testEnv.projectId}-default-rtdb`, (res) => {
      res.pipe(fstream, { end: true });

      res.on("end", resolve);
      res.on("error", reject);
    });
  });

  console.log(`View database rule coverage information at ${coverageFile}\n`);
});

beforeEach(async () => {
  testEnv.clearDatabase();

  // Define Rules Test Contexts here to dry up tests and avoid cache issues;
  // included inline instead to be self-contained examples.
  // unauthedDb = testEnv.unauthenticatedContext().firestore();
  // aliceDb = testEnv.authenticatedContext('alice').firestore();
  // bobDb = testEnv.authenticatedContext('bob').firestore();

});

describe("Public profiles", () => {
  it('should allow anyone to read any profile', async () => {
    // Setup: Create ref for testing (bypassing Security Rules)
    testEnv.withSecurityRulesDisabled(async context => {
      await context.database().ref('users/foobar').set({ foo: 'bar' });
    });
    // Setup: Assign Rules Test Context
    unauthedDb = testEnv.unauthenticatedContext().firestore();
    // Then test our security rules by trying to read it using the client SDK.
    await assertSucceeds(get(ref(unauthedDb, 'users/foobar')));
  });

  it('should not allow users to read from a random collection', async () => {
    unauthedDb = testEnv.unauthenticatedContext().firestore();

    await assertFails(get(ref(unauthedDb, 'foo/bar')));
  });

  it("should ONLY allow users to modify their own profiles", async () => {
    aliceDb = testEnv.authenticatedContext('alice').firestore();
    unauthedDb = testEnv.unauthenticatedContext().firestore();

    await assertSucceeds(update(ref(aliceDb, 'users/alice'), { favorite_color: "blue" }));
    await assertFails(update(ref(aliceDb, 'users/bob'), { favorite_color: "red" }));
    await assertFails(update(ref(unauthedDb, 'users/alice'), { favorite_color: "orange" }));
  });
});

describe("Chat room creation", () => {
  it('should only be created by user listed as owner', async () => {
    aliceDb = testEnv.authenticatedContext('alice').firestore();

    // Non-owner cannot create a room
    await assertFails(update(ref(aliceDb, 'rooms/room1'), {owner: "bob"}));

    // Owner can create room
    await assertSucceeds(update(ref(aliceDb, 'rooms/room1'), {owner: "alice"}));
  });
});

describe("Chat rooms members", () => {
  it('should ONLY be able to added by owner', async () => {
    aliceDb = testEnv.authenticatedContext('alice').firestore();
    bobDb = testEnv.authenticatedContext('bob').firestore();

    // Owner can add a member
    await assertSucceeds(update(ref(aliceDb, 'rooms/room1'), {owner: "alice"}));
    await assertSucceeds(update(ref(aliceDb, 'rooms/room1/members'), {bob: true}));

    // Others can't add members
    await assertFails(update(ref(bobDb, 'rooms/room1/members'), {bob: true}));
  });
});
