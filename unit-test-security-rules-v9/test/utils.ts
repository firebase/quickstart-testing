import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { expect } from '@jest/globals';

/**
 * The FIRESTORE_EMULATOR_HOST environment variable is set automatically
 * by "firebase emulators:exec", but if you want to provide the host and port manually
 * you can use the code below to use either.
 */
export function parseHostAndPort(hostAndPort: string | undefined): { host: string; port: number; } | undefined {
  if(hostAndPort == undefined) { return undefined; }
  const pieces = hostAndPort.split(':');
  return {
    host: pieces[0],
    port: parseInt(pieces[1], 10),
  };
}

export function getFirestoreCoverageMeta(projectId: string, firebaseJsonPath: string) {
  const { emulators } = require(firebaseJsonPath);
  const hostAndPort = parseHostAndPort(process.env.FIRESTORE_EMULATOR_HOST);
  const { host, port } = hostAndPort != undefined ? hostAndPort : emulators.firestore!;
  const coverageUrl = `http://${host}:${port}/emulator/v1/projects/${projectId}:ruleCoverage.html`;
  return {
    host,
    port,
    coverageUrl,
  }
}

/**
 * The FIREBASE_DATABASE_EMULATOR_HOST environment variable is set automatically
 * by "firebase emulators:exec"
 */
export function getDatabaseCoverageMeta(databaseName: string, firebaseJsonPath: string) {
  const { emulators } = require(firebaseJsonPath);
  const hostAndPort = parseHostAndPort(process.env.FIREBASE_DATABASE_EMULATOR_HOST);
  const { host, port } = hostAndPort != null ? hostAndPort : emulators.database!;
  const coverageUrl = `http://${host}:${port}/.inspect/coverage?ns=${databaseName}`;
  return {
    host,
    port,
    coverageUrl,
  }
}

export async function expectFirestorePermissionDenied(promise: Promise<any>) {
  const errorResult = await assertFails(promise);
  expect(errorResult.code).toBe('permission-denied' || 'PERMISSION_DENIED');
}

export async function expectDatabasePermissionDenied(promise: Promise<any>) {
  const errorResult = await assertFails(promise);
  expect(errorResult.code).toBe('PERMISSION_DENIED');
}

export async function expectFirestorePermissionUpdateSucceeds(promise: Promise<any>) {
  const successResult = await assertSucceeds(promise);
  expect(successResult).toBeUndefined();
}

export async function expectPermissionGetSucceeds(promise: Promise<any>) {
  expect(assertSucceeds(promise)).not.toBeUndefined();
}

export async function expectDatabasePermissionUpdateSucceeds(promise: Promise<any>) {
  const successResult = await assertSucceeds(promise);
  expect(successResult).toBeUndefined();
}
