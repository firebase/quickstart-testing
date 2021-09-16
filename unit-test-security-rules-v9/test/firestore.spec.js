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

  console.log(`View firestore rule coverage information at ${coverageFile}\n`);
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

// If you want to define global variables for Rules Test Contexts to save some
// typing, make sure to initialize them for *every test* to avoid cache issues.
//
//     let unauthedDb;
//     beforeEach(() => {
//       unauthedDb = testEnv.unauthenticatedContext().database();
//     });
//
// Or you can just create them inline to make tests self-contained like below.

describe("Public user profiles", () => {
  it('should let anyone read any profile', async function() {
    // Setup: Create documents in DB for testing (bypassing Security Rules).
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'users/foobar'), { foo: 'bar' });
    });

    const unauthedDb = testEnv.unauthenticatedContext().firestore();

    // Then test security rules by trying to read it using the client SDK.
    await assertSucceeds(getDoc(doc(unauthedDb, 'users/foobar')));
  });

  it('should not allow users to read from a random collection', async () => {
    unauthedDb = testEnv.unauthenticatedContext().firestore();

    await assertFails(getDoc(doc(unauthedDb, 'foo/bar')));
  });

  it("should allow ONLY signed in users to create their own profile with required `createdAt` field", async () => {
    const aliceDb = testEnv.authenticatedContext('alice').firestore();

    await assertSucceeds(setDoc(doc(aliceDb, 'users/alice'), {
      birthday: "January 1",
      createdAt: serverTimestamp(),
    }));

    // Signed in user with required fields for others' profile
    await assertFails(setDoc(doc(aliceDb, 'users/bob'), {
      birthday: "January 1",
      createdAt: serverTimestamp(),
    }));

    // Signed in user without required fields
    await assertFails(setDoc(doc(aliceDb, 'users/alice'), {
      birthday: "January 1",
    }));

  });
});

describe("Chat rooms", () => {
  it('should ONLY allow users to create a room they own', async function() {
    const aliceDb = testEnv.authenticatedContext('alice').firestore();

    await assertSucceeds(setDoc(doc(aliceDb, 'rooms/snow'), {
      owner: "alice",
      topic: "All Things Snowboarding",
    }));

  });

  it('should not allow room creation by a non-owner', async function() {
    const aliceDb = testEnv.authenticatedContext('alice').firestore();

    await assertFails(setDoc(doc(aliceDb, 'rooms/boards'), {
      owner: "bob",
      topic: "All Things Snowboarding",
    }));
  });

  it('should not allow an update that changes the room owner', async function(){
    const aliceDb = testEnv.authenticatedContext('alice').firestore();

    await assertFails(setDoc(doc(aliceDb, 'rooms/snow'), {
      owner: "bob",
      topic: "All Things Snowboarding",
    }));
  });
});
