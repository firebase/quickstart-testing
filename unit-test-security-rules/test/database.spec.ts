/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { get } from 'node:http';
import { readFileSync, createWriteStream } from 'node:fs';
import { describe, test, expect, beforeEach, beforeAll, afterAll } from '@jest/globals';
import { initializeTestEnvironment, RulesTestEnvironment, assertSucceeds } from '@firebase/rules-unit-testing';
import { getDatabaseCoverageMeta, expectDatabasePermissionDenied, expectDatabasePermissionUpdateSucceeds } from './utils';
import { resolve } from 'node:path';

let testEnv: RulesTestEnvironment;

/**
 * The emulator will accept any database name for testing.
 */
const DATABASE_NAME = 'database-emulator-example';
const PROJECT_ID = 'fakeproject';
const FIREBASE_JSON = resolve(__dirname, '../firebase.json');

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

beforeEach(async () => {
  // Clear the database between tests
  await testEnv.clearDatabase();
});

afterAll(async () => {
  // Write the coverage report to a file
  const { coverageUrl } = getDatabaseCoverageMeta(DATABASE_NAME, FIREBASE_JSON)
  const coverageFile = 'database-coverage.html';
  const fstream = createWriteStream(coverageFile);
  await new Promise((resolve, reject) => {
    get(coverageUrl, (res) => {
      res.pipe(fstream, { end: true });
      res.on('end', resolve);
      res.on('error', reject);
    });
  });

  console.log(`View database rule coverage information at ${coverageFile}\n`);
});

describe('profile read rules', () => {
  test('should allow anyone to read profiles', async () => {
    const alice = testEnv.authenticatedContext('alice').database();
    const bob = testEnv.authenticatedContext('bob').database();
    const noone = testEnv.unauthenticatedContext().database();

    testEnv.withSecurityRulesDisabled(async adminContext => {
      await adminContext.database().ref('users/alice').set({
        name: 'Alice',
        profilePicture: 'http://cool_photos/alice.jpg',
      });
    });

    await expect(assertSucceeds(alice.ref('users/alice').once('value'))).not.toBeUndefined();
    await expect(assertSucceeds(bob.ref('users/alice').once('value'))).not.toBeUndefined();
    await expect(assertSucceeds(noone.ref('users/alice').once('value'))).not.toBeUndefined();
  });

  test('should only allow users to modify their own profiles', async () => {
    const alice = testEnv.authenticatedContext('alice').database();
    const bob = testEnv.authenticatedContext('bob').database();
    const noone = testEnv.unauthenticatedContext().database();

    await expectDatabasePermissionUpdateSucceeds(
      alice.ref('users/alice').update({
        favorite_color: 'blue',
      })
    );
    await expectDatabasePermissionDenied(
      bob.ref('users/alice').update({
        favorite_color: 'red',
      })
    );
    await expectDatabasePermissionDenied(
      noone.ref('users/alice').update({
        favorite_color: 'orange',
      })
    );
  });
});

describe('room creation', () => {
  test('should require the user creating a room to be its owner', async () => {
    const alice = testEnv.authenticatedContext('alice').database();

    // should not be able to create room owned by another user
    await expectDatabasePermissionDenied(alice.ref('rooms/room1').set({ owner: 'bob' }));
    // should not be able to create room with no owner
    await expectDatabasePermissionDenied(
      alice.ref('rooms/room1').set({ members: { alice: true } })
    );
    // alice should be allowed to create a room she owns
    await expectDatabasePermissionUpdateSucceeds(
      alice.ref('rooms/room1').set({ owner: 'alice' })
    );
  });
});

describe('room members', () => {
  test('must be added by the room owner', async () => {
    const ownerId = 'room_owner';
    const owner = testEnv.authenticatedContext(ownerId).database();
    await owner.ref('rooms/room2').set({ owner: ownerId });

    const alice = testEnv.authenticatedContext('alice').database();
    // alice cannot add random people to a room
    await expectDatabasePermissionDenied(
      alice.ref('rooms/room2/members/rando').set(true)
    );
    // alice cannot add herself to a room
    await expectDatabasePermissionDenied(
      alice.ref('rooms/room2/members/alice').set(true)
    );
    // the owner can add alice to a room
    await expectDatabasePermissionUpdateSucceeds(
      owner.ref('rooms/room2/members/alice').set(true)
    );
  });
});
