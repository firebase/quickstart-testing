// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
const {
  initializeTestEnvironment,
  assertSucceeds,
} = require("@firebase/rules-unit-testing");

const TEST_FIREBASE_PROJECT_ID = "test-firestore-rules-project";

const seedItems = {
  chocolate: 4.99,
  "coffee beans": 12.99,
  milk: 5.99,
};

const aliceAuth = {
  uid: "alice",
  email: "alice@example.com",
};

let testEnv;

before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: TEST_FIREBASE_PROJECT_ID,
  });
});

after(async () => {
  await testEnv.cleanup();
});

// Unit test the security rules
describe("shopping carts", () => {
  let db;

  beforeEach(() => {
    db = testEnv.authenticatedContext("alice").firestore();
  });

  afterEach(async () => {
    await testEnv.clearFirestore();
  });

  it("can be created by the cart owner", async () => {
    await assertSucceeds(
      db.doc("carts/alicesCart").set({
        ownerUID: "alice",
        total: 0,
      }),
    );
  });
});

describe("shopping carts", () => {
  let db;

  beforeEach(async () => {
    db = testEnv.authenticatedContext("alice").firestore();

    // Create Alice's cart using admin context
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().doc("carts/alicesCart").set({
        ownerUID: "alice",
        total: 0,
      });
    });
  });

  afterEach(async () => {
    await testEnv.clearFirestore();
  });

  it("can be read, updated, and deleted by the cart owner", async () => {
    await assertSucceeds(db.doc("carts/alicesCart").get());
  });
});

describe("shopping cart items", () => {
  let db;

  beforeEach(async () => {
    db = testEnv.authenticatedContext("alice").firestore();

    // Setup using admin context
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const admin = context.firestore();
      // Create Alice's cart
      await admin.doc("carts/alicesCart").set({
        ownerUID: "alice",
        total: 0,
      });

      // Create Items Subcollection in Alice's Cart
      const alicesItemsRef = admin.doc("carts/alicesCart").collection("items");
      for (const name of Object.keys(seedItems)) {
        await alicesItemsRef.doc(name).set({ value: seedItems[name] });
      }
    });
  });

  afterEach(async () => {
    await testEnv.clearFirestore();
  });

  it("can be read by the cart owner", async () => {
    await assertSucceeds(db.doc("carts/alicesCart/items/milk").get());
  });

  it("can be added by the cart owner", async () => {
    await assertSucceeds(
      db.doc("carts/alicesCart/items/lemon").set({
        name: "lemon",
        price: 0.99,
      }),
    );
  });
});
