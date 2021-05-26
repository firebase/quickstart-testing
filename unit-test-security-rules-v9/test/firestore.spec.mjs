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
import { readFileSync } from 'fs';

// Workarounds for npm not recognizing named exports in cjs.
import appNs from 'firebase/app';
const { initializeApp, deleteApp, getApps } = appNs;

// We can use firestore/lite since we don't need persistence or use listeners.
// Feel free to switch to firebase/firestore if your tests use onSnapshot etc.
import firestoreNs from 'firebase/firestore/lite';
const { getFirestore, useFirestoreEmulator, doc, getDoc, setDoc, serverTimestamp, setLogLevel } = firestoreNs;

import adminAppNs from 'firebase-admin/app';
const { initializeApp: initializeAdminApp } = adminAppNs;
import adminFirestoreNs from 'firebase-admin/firestore';
const { getFirestore: getAdminFirestore } = adminFirestoreNs;
import adminSecurityRulesNs from 'firebase-admin/security-rules';
const { getSecurityRules } = adminSecurityRulesNs;

/**
 * The emulator will accept any project ID for testing.
 */
const PROJECT_ID = "demo-firestore-emulator";

/**
 * The FIRESTORE_EMULATOR_HOST environment variable is set automatically
 * by "firebase emulators:exec"
 */
const { FIRESTORE_EMULATOR_HOST } = process.env;
if (!FIRESTORE_EMULATOR_HOST) {
  throw new Error('Missing environment variable FIRESTORE_EMULATOR_HOST. Consider running tests via `firebase emulators:exec "npm test"`.');
}

const { hostname: FIRESTORE_HOST, port: FIRESTORE_PORT } = new URL(`http://${FIRESTORE_EMULATOR_HOST}`);

before(async () => {
  initializeAdminApp({ projectId: PROJECT_ID });

  // Load the rules file before the tests begin.
  // TODO: Uncomment once it works.
  // getSecurityRules()
  //  .releaseFirestoreRulesetFromSource(readFileSync('firestore.rules', 'utf8'));

  // Silence expected rules rejections from Firestore SDK. Unexpected rejections
  // will still bubble up and will be thrown as an error (failing the tests).
  setLogLevel('error');
});

after(async () => {
  // Delete all the FirebaseApp instances created during testing.
  // Note: this does not affect or clear any data.
  await Promise.all(getApps().map(deleteApp));

  // TODO: Dump coverage report.
});

/**
 * Creates a new client FirebaseApp with authentication and returns the Firestore instance.
 */
function getAuthedFirestore(mockUserToken) {
  const app = initializeApp(
    { projectId: PROJECT_ID },
    'demo-app-' + Date.now() + Math.random()
  );
  const db = getFirestore(app);
  useFirestoreEmulator(db, FIRESTORE_HOST, FIRESTORE_PORT, { mockUserToken });
  return db;
}

beforeEach(async () => {
  // TODO: Clear the database between tests.
});

describe("My Firestore security rules", () => {
  it('should let anyone read any profile', async () => {
    // Setup:
    // Use Admin SDK to create documents for testing (bypassing Security Rules).
    await getAdminFirestore().doc('users/foobar').set({ foo: 'bar' });

    // Then test our security rules by trying to read it using the client SDK.
    const db = getAuthedFirestore(null);
    const userDoc = await getDoc(doc(db, 'users/foobar'));
    assert.deepStrictEqual(userDoc.data(), { foo: 'bar' });
  });

  it('should not allow users to read from a random collection', async () => {
    const db = getAuthedFirestore(null);
    // This is using the client SDK and should be blocked by security rules.
    const readPromise = getDoc(doc(db, 'foo/bar'));

    // Use the Node.js assert library to assert that the promise should be
    // rejected with an Error object with a "code" property that is set to the
    // value "permission-denied" (thrown by Firebase JS SDK on rules rejection).
    await assert.rejects(readPromise, { code: 'permission-denied' });

    // TODO: Show how the @firebase/rules-unit-testing library simplifies this.
  });

  it("should only let users create their own profile", async () => {
    const db = getAuthedFirestore({ sub: "alice" });

    // This should succeed.
    await setDoc(doc(db, 'users/alice'), {
      birthday: "January 1",
      createdAt: serverTimestamp(),
    });

    await assert.rejects(setDoc(doc(db, 'users/bob'), {
      birthday: "January 1",
      createdAt: serverTimestamp(),
    }), { code: 'permission-denied' });
  });

  // TODO: Other tests.
});
