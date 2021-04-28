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
const http = require("http");

const testing = require('@firebase/rules-unit-testing');
const { initializeTestEnvironment, assertFails, assertSucceeds } = testing;

const { doc, getDoc, setDoc, serverTimestamp, setLogLevel } = require('firebase/firestore');

/** @type testing.RulesTestEnvironment */
let testEnv;

before(async () => {
  // Silence expected rules rejections from Firestore SDK. Unexpected rejections
  // will still bubble up and will be thrown as an error (failing the tests).
  setLogLevel('error');

  testEnv = await initializeTestEnvironment({
    firestore: {rules: readFileSync('firestore.rules', 'utf8')},
  });
});

after(async () => {
  // Delete all the FirebaseApp instances created during testing.
  // Note: this does not affect or clear any data.
  await testEnv.cleanup();

  // Write the coverage report to a file
  const coverageFile = 'firestore-coverage.html';
  const fstream = createWriteStream(coverageFile);
  await new Promise((resolve, reject) => {
    const { host, port } = testEnv.emulators.firestore;
    const quotedHost = host.includes(':') ? `[${host}]` : host;
    http.get(`http://${quotedHost}:${port}/emulator/v1/projects/${testEnv.projectId}:ruleCoverage.html`, (res) => {
      res.pipe(fstream, { end: true });

      res.on("end", resolve);
      res.on("error", reject);
    });
  });

  console.log(`View firestore rule coverage information at ${coverageFile}\n`);});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

describe("My Firestore security rules", () => {
  it('should let anyone read any profile', async function() {
    // Setup:
    // Create documents in DB for testing (bypassing Security Rules).
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'users/foobar'), { foo: 'bar' });
    });

    // Then test our security rules by trying to read it using the client SDK.
    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    await assertSucceeds(getDoc(doc(unauthedDb, 'users/foobar')));
  });

  it('should not allow users to read from a random collection', async () => {
    const unauthedDb = testEnv.unauthenticatedContext().firestore();

    await assertFails(getDoc(doc(unauthedDb, 'foo/bar')));
  });

  it("should only let users create their own profile", async () => {
    const db = testEnv.authenticatedContext('alice').firestore();

    await assertSucceeds(setDoc(doc(db, 'users/alice'), {
      birthday: "January 1",
      createdAt: serverTimestamp(),
    }));

    await assertFails(setDoc(doc(db, 'users/bob'), {
      birthday: "January 1",
      createdAt: serverTimestamp(),
    }));
  });

  // TODO: Other tests.
});
