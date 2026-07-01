/**
 * Copyright 2023 Google LLC
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
import { describe, test, beforeEach, beforeAll, afterAll, expect } from '@jest/globals';
import { initializeTestEnvironment, RulesTestEnvironment, assertSucceeds } from '@firebase/rules-unit-testing';
import { serverTimestamp } from 'firebase/firestore'
import { expectFirestorePermissionDenied, expectFirestorePermissionUpdateSucceeds, getFirestoreCoverageMeta, expectPermissionGetSucceeds } from './utils';
const { readFileSync, createWriteStream } = require("node:fs");
const { get } = require("node:http");
import { resolve } from 'node:path';

/**
 * The emulator will accept any project ID for testing.
 */
const PROJECT_ID = "fakeproject";
const FIREBASE_JSON = resolve(__dirname, '../firebase.json');
let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  const { host, port } = getFirestoreCoverageMeta(PROJECT_ID, FIREBASE_JSON);
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      port,
      host,
      rules: readFileSync('firestore.rules', 'utf8')
    },
  });
});

beforeEach(async () => {
  // Clear the database between tests
  await testEnv.clearFirestore();
});

afterAll(async () => {
  // Write the coverage report to a file
  const { coverageUrl } = getFirestoreCoverageMeta(PROJECT_ID, FIREBASE_JSON);
  const coverageFile = './firestore-coverage.html';
  const fstream = createWriteStream(coverageFile);
  await new Promise((resolve, reject) => {
    get(coverageUrl, (res) => {
      res.pipe(fstream, { end: true });
      res.on("end", resolve);
      res.on("error", reject);
    });
  });
  console.log(`View firestore rule coverage information at ${coverageFile}\n`);
});

describe("My app", () => {
  test("require users to log in before creating a profile", async () => {
    const db = testEnv.unauthenticatedContext().firestore()
    const profile = db.collection("users").doc("alice");
    await expectFirestorePermissionDenied(profile.set({ birthday: "January 1" }))
  });

  test("should enforce the createdAt date in user profiles", async () => {
    const db = testEnv.authenticatedContext('alice').firestore();
    const profile = db.collection("users").doc("alice");
    await expectFirestorePermissionDenied(profile.set({ birthday: "January 1" }));
    await expectFirestorePermissionUpdateSucceeds(
      profile.set({
        birthday: "January 1",
        createdAt: serverTimestamp(),
      })
    );
  });

  test("should only let users create their own profile", async () => {
    const db = testEnv.authenticatedContext('alice').firestore();
    await expectFirestorePermissionUpdateSucceeds(
      db.collection("users").doc("alice").set({
        birthday: "January 1",
        createdAt: serverTimestamp(),
      })
    );
    await expectFirestorePermissionDenied(
      db.collection("users").doc("bob").set({
        birthday: "January 1",
        createdAt: serverTimestamp(),
      })
    );
  });

  test("should let anyone read any profile", async () => {
    const db = testEnv.unauthenticatedContext().firestore()
    const profile = db.collection("users").doc("alice");
    expectPermissionGetSucceeds(profile.get());
  });

  test("should let anyone create a room", async () => {
    const db = testEnv.authenticatedContext('alice').firestore();
    const room = db.collection("rooms").doc("firebase");
    await expectFirestorePermissionUpdateSucceeds(
      room.set({
        owner: "alice",
        topic: "All Things Firebase",
      })
    );
  });

  test("should force people to name themselves as room owner when creating a room", async () => {
    const db = testEnv.authenticatedContext('alice').firestore();
    const room = db.collection("rooms").doc("firebase");
    await expectFirestorePermissionDenied(
      room.set({
        owner: "scott",
        topic: "Firebase Rocks!",
      })
    );
  });

  test("should not let one user steal a room from another user", async () => {
    const alice = testEnv.authenticatedContext('alice').firestore();
    const bob = testEnv.authenticatedContext('bob').firestore();

    await expectFirestorePermissionUpdateSucceeds(
      bob.collection("rooms").doc("snow").set({
        owner: "bob",
        topic: "All Things Snowboarding",
      })
    );

    await expectFirestorePermissionDenied(
      alice.collection("rooms").doc("snow").set({
        owner: "alice",
        topic: "skiing > snowboarding",
      })
    );
  });
});
