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
});

describe("My Realtime Database security rules", () => {
  it('should let anyone read any profile', async () => {
    // Setup:
    // Use Admin SDK to create documents for testing (bypassing Security Rules).
    testEnv.withSecurityRulesDisabled(async context => {
      await context.database().ref('users/foobar').set({ foo: 'bar' });
    });

    // Then test our security rules by trying to read it using the client SDK.
    const unauthedDb = testEnv.unauthenticatedContext().database();
    await assertSucceeds(get(ref(unauthedDb, 'users/foobar')));
  });

  it('should not allow users to read from a random collection', async () => {
    const unauthedDb = testEnv.unauthenticatedContext().database();

    await assertFails(get(ref(unauthedDb, 'foo/bar')));
  });

  it("should only allow users to modify their own profiles", async () => {
    const alice = testEnv.authenticatedContext('alice').database();
    const bob = testEnv.authenticatedContext('bob').database();
    const noone = testEnv.unauthenticatedContext().database();

    await assertSucceeds(update(ref(alice, 'users/alice'), { favorite_color: "blue" }));
    await assertFails(update(ref(bob, 'users/alice'), { favorite_color: "red" }));
    await assertFails(update(ref(noone, 'users/alice'), { favorite_color: "orange" }));
  });

  // TODO: Other tests.
});
