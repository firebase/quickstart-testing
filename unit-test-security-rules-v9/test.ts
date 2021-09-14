/*
assertSucceeds(Promise.resolve());

initializeTestEnvironment({});
*/

import firebase from 'firebase/compat/app';
require('../../firebase-js-sdk/packages/rules-unit-testing')
//require('firebase/compat/database');
firebase.initializeApp({}).database();
