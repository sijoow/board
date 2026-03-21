import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// .env.local 파일에 저장된 환경 변수를 불러옵니다.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Next.js 개발 환경에서 핫 리로드 시 중복 초기화되는 것을 방지
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Firestore DB 인스턴스 내보내기
export const db = getFirestore(app);
