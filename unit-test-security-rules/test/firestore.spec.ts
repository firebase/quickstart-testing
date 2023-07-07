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
import { describe, test, expect, beforeEach, beforeAll, afterAll } from '@jest/globals';
import { initializeTestEnvironment, RulesTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { serverTimestamp } from 'firebase/firestore'
const { emulators } = require('../firebase.json');
const { readFileSync, createWriteStream } = require("node:fs");
const { get } = require("node:http");

/**
 * The emulator will accept any project ID for testing.
 */
const PROJECT_ID = "fakeproject";

/**
 * The FIRESTORE_EMULATOR_HOST environment variable is set automatically
 * by "firebase emulators:exec", but if you want to provide the host and port manually
 * you can use the code below to use either.
 */
function parseHostAndPort(hostAndPort: string | undefined): { host: string; port: number; } | undefined {
  if(hostAndPort == undefined) { return undefined; }
  const pieces = hostAndPort.split(':');
  return {
    host: pieces[0],
    port: parseInt(pieces[1], 10),
  };
}

function getCoverageMeta() {
  const hostAndPort = parseHostAndPort(process.env.FIRESTORE_EMULATOR_HOST);
  const { host, port } = hostAndPort != null ? hostAndPort : emulators.firestore!;
  const coverageUrl = `http://${host}:${port}/emulator/v1/projects/${PROJECT_ID}:ruleCoverage.html`;
  return {
    host,
    port,
    coverageUrl,
  }
}

async function expectPermissionDenied(promise: Promise<any>) {
  const errorResult = await assertFails(promise);
  expect(errorResult.code).toBe('permission-denied');
}

async function expectPermissionSucceeds(promise: Promise<any>) {
  const successResult = await assertSucceeds(promise);
  expect(successResult).toBeUndefined();
}

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  const { host, port } = getCoverageMeta();
  testEnv = await initializeTestEnvironment({
    projectId: 'fakeproject',
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
  const { coverageUrl } = getCoverageMeta();
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
    await expectPermissionDenied(profile.set({ birthday: "January 1" }))
  });

  test("should enforce the createdAt date in user profiles", async () => {
    const db = testEnv.authenticatedContext('alice').firestore();
    const profile = db.collection("users").doc("alice");
    await expectPermissionDenied(profile.set({ birthday: "January 1" }));
    await expectPermissionSucceeds(
      profile.set({
        birthday: "January 1",
        createdAt: serverTimestamp(),
      })
    );
  });

  test("should only let users create their own profile", async () => {
    const db = testEnv.authenticatedContext('alice').firestore();
    await expectPermissionSucceeds(
      db.collection("users").doc("alice").set({
        birthday: "January 1",
        createdAt: serverTimestamp(),
      })
    );
    await expectPermissionDenied(
      db.collection("users").doc("bob").set({
        birthday: "January 1",
        createdAt: serverTimestamp(),
      })
    );
  });

  test("should let anyone read any profile", async () => {
    const db = testEnv.unauthenticatedContext().firestore()
    const profile = db.collection("users").doc("alice");
    await assertSucceeds(profile.get());
  });

  test("should let anyone create a room", async () => {
    const db = testEnv.authenticatedContext('alice').firestore();
    const room = db.collection("rooms").doc("firebase");
    await expectPermissionSucceeds(
      room.set({
        owner: "alice",
        topic: "All Things Firebase",
      })
    );
  });

  test("should force people to name themselves as room owner when creating a room", async () => {
    const db = testEnv.authenticatedContext('alice').firestore();
    const room = db.collection("rooms").doc("firebase");
    await expectPermissionDenied(
      room.set({
        owner: "scott",
        topic: "Firebase Rocks!",
      })
    );
  });

  test("should not let one user steal a room from another user", async () => {
    const alice = testEnv.authenticatedContext('alice').firestore();
    const bob = testEnv.authenticatedContext('bob').firestore();

    await expectPermissionSucceeds(
      bob.collection("rooms").doc("snow").set({
        owner: "bob",
        topic: "All Things Snowboarding",
      })
    );

    await expectPermissionDenied(
      alice.collection("rooms").doc("snow").set({
        owner: "alice",
        topic: "skiing > snowboarding",
      })
    );
  });
});
