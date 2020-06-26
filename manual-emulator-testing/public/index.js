/**
 * Copyright 2020 Google LLC
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

// Initialze Firestore pointing at our test project
const db = firebase.initializeApp({ 
  projectId: "manual-emulator-testing" 
}).firestore();

// Connect the Firestore SDK to the local emulator
db.settings({ 
  host: "localhost:8080", 
  ssl: false 
});

// Use Vue.js to populate the UI with data
//
// Note: there is no special integration between Vue.js and Firebase, feel free
// to use any JavaScript framework you want in your own code!
const app = new Vue({
  el: '#app',
  data: {
    messages: [],
    msgInput: "",
  },
  methods: {
    submit: function() {
      console.log("Adding message...");
      db.collection("messages").add({
        text: this.msgInput,
        time: firebase.firestore.FieldValue.serverTimestamp()
      });

      this.msgInput = "";
    }
  },
  created: function () {
    // Listen to the messages collection
    db.collection("messages")
      .orderBy("time", "asc")
      .onSnapshot(snap => {
        console.log("Got data from firestore!");
        this.messages = snap.docs.map(doc => doc.data());
      });
  }
});