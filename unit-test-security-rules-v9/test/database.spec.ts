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
import { describe, test, beforeEach, beforeAll, afterAll, expect } from '@jest/globals';
import { initializeTestEnvironment, RulesTestEnvironment, assertFails } from '@firebase/rules-unit-testing';
import { getDatabaseCoverageMeta, expectDatabasePermissionDenied, expectDatabasePermissionUpdateSucceeds, expectPermissionGetSucceeds } from '../../utils';
import { readFileSync, createWriteStream } from "node:fs";
import http from "node:http";
import { resolve } from 'node:path';
import { ref, get, update } from 'firebase/database';

const DATABASE_NAME = 'database-emulator-example';
const PROJECT_ID = 'demo-example-testing';
const FIREBASE_JSON = resolve(__dirname, '../firebase.json');
let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  const { host, port } = getDatabaseCoverageMeta(DATABASE_NAME, FIREBASE_JSON);
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    database: {
      port,
      host,
      rules: readFileSync('database.rules.json', 'utf8')
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
  // Write the coverage report to a file
  debugger;
  const { coverageUrl } = getDatabaseCoverageMeta(DATABASE_NAME, FIREBASE_JSON);
  const coverageFile = 'database-coverage.html';
  const fstream = createWriteStream(coverageFile);
  await new Promise((resolve, reject) => {
    http.get(coverageUrl, (res) => {
      res.pipe(fstream, { end: true });
      res.on('end', resolve);
      res.on('error', reject);
    });
  });

  console.log(`View database rule coverage information at ${coverageFile}\n`);
});

beforeEach(async () => {
  testEnv.clearDatabase();
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

describe("Public profiles", () => {
  test('should allow anyone to read any profile', async () => {
    // Setup: Create ref for testing (bypassing Security Rules)
    testEnv.withSecurityRulesDisabled(async context => {
      await context.database().ref('users/foobar').set({ foo: 'bar' });
    });
    // Setup: Create Rules Test Context
    const unauthedDb = testEnv.unauthenticatedContext().database();
    // Then test our security rules by trying to read it using the client SDK.
    await expectPermissionGetSucceeds(get(ref(unauthedDb, 'users/foobar')));
  });

  test('should not allow users to read from a random collection', async () => {
    const unauthedDb = testEnv.unauthenticatedContext().database();
    await expect(assertFails(get(ref(unauthedDb, 'foo/bar')))).resolves;
    // await expectDatabasePermissionDenied(get(ref(unauthedDb, 'foo/bar')));
  });

  test("should ONLY allow users to modify their own profiles", async () => {
    const aliceDb = testEnv.authenticatedContext('alice').database();
    const unauthedDb = testEnv.unauthenticatedContext().database();

    await expectDatabasePermissionUpdateSucceeds(update(ref(aliceDb, 'users/alice'), { favorite_color: "blue" }));
    await expectDatabasePermissionDenied(update(ref(aliceDb, 'users/bob'), { favorite_color: "red" }));
    await expectDatabasePermissionDenied(update(ref(unauthedDb, 'users/alice'), { favorite_color: "orange" }));
  });
});

describe("Chat room creation", () => {
  test('should only be created by user listed as owner', async () => {
    const aliceDb = testEnv.authenticatedContext('alice').database();

    // Non-owner cannot create a room
    await expectDatabasePermissionDenied(update(ref(aliceDb, 'rooms/room1'), {owner: "bob"}));

    // Owner can create room
    await expectDatabasePermissionUpdateSucceeds(update(ref(aliceDb, 'rooms/room1'), {owner: "alice"}));
  });
});

describe("Chat rooms members", () => {
  test('should ONLY be able to added by owner', async () => {
    const aliceDb = testEnv.authenticatedContext('alice').database();
    const bobDb = testEnv.authenticatedContext('bob').database();

    // Owner can add a member
    await expectDatabasePermissionUpdateSucceeds(update(ref(aliceDb, 'rooms/room1'), {owner: "alice"}));
    await expectDatabasePermissionUpdateSucceeds(update(ref(aliceDb, 'rooms/room1/members'), {bob: true}));

    // Others can't add members
    await expectDatabasePermissionDenied(update(ref(bobDb, 'rooms/room1/members'), {bob: true}));
  });
});
