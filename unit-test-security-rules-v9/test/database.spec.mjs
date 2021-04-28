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
import assert from 'assert';
import { readFileSync, createWriteStream } from 'fs';
import http from 'http';

// Workarounds for npm not recognizing named exports in cjs.
import appNs from 'firebase/app';
const { initializeApp, deleteApp, getApps, setLogLevel } = appNs;
import dbNs from 'firebase/database';
const { getDatabase, useDatabaseEmulator, ref, get, update } = dbNs;

import adminAppNs from 'firebase-admin/app';
const { initializeApp: initializeAdminApp } = adminAppNs;
import adminDatabaseNs from 'firebase-admin/database';
const { getDatabase: getAdminDatabase } = adminDatabaseNs;

/**
 * The emulator will accept any database name for testing.
 */
const DATABASE_NAME = "demo-database-emulator";

/**
 * The FIREBASE_DATABASE_EMULATOR_HOST environment variable is set automatically
 * by "firebase emulators:exec"
 */
const { FIREBASE_DATABASE_EMULATOR_HOST } = process.env;
if (!FIREBASE_DATABASE_EMULATOR_HOST) {
  throw new Error('Missing environment variable FIREBASE_DATABASE_EMULATOR_HOST. Consider running tests via `firebase emulators:exec "npm test"`.');
}

const DATABASE_URL = `http://${FIREBASE_DATABASE_EMULATOR_HOST}/?ns=${DATABASE_NAME}`
const { hostname: DATABASE_HOST, port: DATABASE_PORT } = new URL(DATABASE_URL);

const COVERAGE_URL = `http://${FIREBASE_DATABASE_EMULATOR_HOST}/.inspect/coverage?ns=${DATABASE_NAME}`;

before(async () => {
  initializeAdminApp({ databaseURL: DATABASE_URL });

  // Set database rules before running these tests.
  await getAdminDatabase().setRules(readFileSync("database.rules.json", "utf8"));

  // Silence expected rules rejections from Firestore SDK. Unexpected rejections
  // will still bubble up and will be thrown as an error (failing the tests).
  setLogLevel('error');
});

after(async () => {
  // Delete all the FirebaseApp instances created during testing.
  // Note: this does not affect or clear any data.
  await Promise.all(getApps().map(deleteApp));

  // Write the coverage report to a file
  const coverageFile = 'database-coverage.html';
  const fstream = createWriteStream(coverageFile);
  await new Promise((resolve, reject) => {
      http.get(COVERAGE_URL, (res) => {
        res.pipe(fstream, { end: true });

        res.on("end", resolve);
        res.on("error", reject);
      });
  });

  console.log(`View database rule coverage information at ${coverageFile}\n`);
});

/**
 * Creates a new client FirebaseApp with authentication and returns the Database instance.
 */
function getAuthedDatabase(auth) {
  const app = initializeApp(
    { databaseURL: DATABASE_URL },
    'demo-app-' + Date.now() + Math.random()
  );
  const db = getDatabase(app);
  useDatabaseEmulator(db, DATABASE_HOST, DATABASE_PORT, { mockUserToken: auth });
  return db;
}

beforeEach(async () => {
  // Clear the database between tests.
  await getAdminDatabase().ref().set(null);
});

describe("My Realtime Database security rules", () => {
  it('should let anyone read any profile', async () => {
    // Setup:
    // Use Admin SDK to create documents for testing (bypassing Security Rules).
    await getAdminDatabase().ref('users/foobar').set({ foo: 'bar' });

    // Then test our security rules by trying to read it using the client SDK.
    const db = getAuthedDatabase(null);
    const userDoc = await get(ref(db, 'users/foobar'));
    assert.deepStrictEqual(userDoc.val(), { foo: 'bar' });
  });

  it('should not allow users to read from a random collection', async () => {
    const db = getAuthedDatabase(null);
    // This is using the client SDK and should be blocked by security rules.
    const writePromise = get(ref(db, 'foo/bar'));

    // Use the Node.js assert library to assert that the promise should be
    // rejected with error message "Permission denied" (thrown by client SDK).
    await assert.rejects(writePromise, { message: 'Permission denied' });

    // TODO: Show how the @firebase/rules-unit-testing library simplifies this.
  });

  it("should only allow users to modify their own profiles", async () => {
    const alice = getAuthedDatabase({ sub: "alice" });
    const bob = getAuthedDatabase({ sub: "bob" });
    const noone = getAuthedDatabase(null);

    await update(ref(alice, 'users/alice'), { favorite_color: "blue" });
    await assert.rejects(
      update(ref(bob, 'users/alice'), { favorite_color: "red", }),
      { message: 'PERMISSION_DENIED: Permission denied' }
    );
    await assert.rejects(
      update(ref(noone, 'users/alice'), { favorite_color: "orange", }),
      { message: 'PERMISSION_DENIED: Permission denied' }
    );
  });

  // TODO: Other tests.
});
