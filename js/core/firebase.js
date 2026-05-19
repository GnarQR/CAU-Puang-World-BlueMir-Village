// ================================================================
// firebase.js — Firebase 초기화 (compat 버전)
// type="module" 없이 일반 script로 로드 가능
// 반드시 firebase-app-compat.js, firebase-firestore-compat.js 다음에 로드
// ================================================================

const firebaseConfig = {
  apiKey:            "AIzaSyAxmmyHDkZLLelQhexrCKMi1a3tfQemAFg",
  authDomain:        "cau-animal-farm.firebaseapp.com",
  projectId:         "cau-animal-farm",
  storageBucket:     "cau-animal-farm.firebasestorage.app",
  messagingSenderId: "1088609082156",
  appId:             "1:1088609082156:web:b5a41ce6fa95ba1b2eaa89",
  measurementId:     "G-L9NRPKD3CC"
};

firebase.initializeApp(firebaseConfig);

// Firestore 인스턴스 전역 노출
const db = firebase.firestore();
window.db = db;

// state.js에서 사용하는 함수들을 compat 방식으로 래핑
window.doc = function(db, collection, id) {
  return db.collection(collection).doc(id);
};

window.getDoc = async function(docRef) {
  return await docRef.get();
};

window.setDoc = async function(docRef, data, options) {
  if (options && options.merge) {
    return await docRef.set(data, { merge: true });
  }
  return await docRef.set(data);
};

console.log('Firebase 초기화 완료');