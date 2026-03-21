import { db } from "./firebase";
import { 
  collection, 
  addDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  increment
} from "firebase/firestore";

// 게시판 모델 타입
export interface Board {
  id?: string;
  projectName: string;
  clientName: string;
  status: "pending_feedback" | "in_progress" | "edit_requested" | "approved" | "deleted";
  currentVersion: number;
  images?: Record<string, string | string[]>; // 버전별 이미지 배열 Base64 저장
  createdAt: any;
  updatedAt: any;
  deletedAt?: any;
  approvedAt?: any;
  unreadMessages: number;
}

// 메시지 모델 (핀 좌표 포함)
export interface Message {
  id?: string;
  sender: "admin" | "client" | "system";
  text: string;
  targetVersion?: number;
  pinX?: number; // X 좌표 (%)
  pinY?: number; // Y 좌표 (%)
  pinIndex?: number; // 화면 표시용 마커 번호
  imageIndex?: number; // 여러 장의 시안 중 몇 번째 이미지인지
  createdAt: any;
}

// 1. 새 게시판 생성 (DB에 저장)
export const createBoard = async (projectName: string, clientName: string, initialImages: string[]) => {
  const docRef = await addDoc(collection(db, "boards"), {
    projectName,
    clientName,
    status: "pending_feedback",
    currentVersion: 1,
    images: { "1": initialImages },
    unreadMessages: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

// 2. 메시지 및 좌표 핀 전송
export const sendMessage = async (
  boardId: string, 
  sender: "admin" | "client" | "system", 
  text: string, 
  targetVersion?: number,
  pinX?: number,
  pinY?: number,
  pinIndex?: number,
  imageIndex?: number
) => {
  const messagesRef = collection(db, "boards", boardId, "messages");
  await addDoc(messagesRef, {
    sender,
    text,
    ...(targetVersion ? { targetVersion } : {}),
    ...(pinX !== undefined ? { pinX } : {}),
    ...(pinY !== undefined ? { pinY } : {}),
    ...(pinIndex !== undefined ? { pinIndex } : {}),
    ...(imageIndex !== undefined ? { imageIndex } : {}),
    createdAt: serverTimestamp()
  });

  // 클라이언트가 보낸 메시지인 경우 관리자 대시보드 알림용 unreadMessages 증가
  if (sender === "client") {
    const boardRef = doc(db, "boards", boardId);
    await updateDoc(boardRef, { unreadMessages: increment(1) });
  }

  if (sender !== "system") {
    // 게시판 업데이트 시간 갱신
    const boardRef = doc(db, "boards", boardId);
    await updateDoc(boardRef, {
      updatedAt: serverTimestamp(),
      unreadMessages: sender === "client" ? 1 : 0 // 간단한 알림 로직
    });
  }
};

// 2-2. 새로운 시안(버전) 등록하기 (다중 이미지 포함)
export const uploadNewVersion = async (boardId: string, newVersion: number, newImagesBase64: string[]) => {
  const boardRef = doc(db, "boards", boardId);
  await updateDoc(boardRef, { 
    currentVersion: newVersion, 
    [`images.${newVersion}`]: newImagesBase64,
    status: "pending_feedback", 
    updatedAt: serverTimestamp() 
  });
  
  // 시스템 메시지도 자동으로 추가
  await sendMessage(boardId, "system", `📢 인쇄소에서 ${newVersion}차 시안을 새로 업로드했습니다.`, newVersion);
};

// 3. 상태 변경 (승인, 수정 요청 등)
export const updateBoardStatus = async (boardId: string, status: Board["status"]) => {
  const boardRef = doc(db, "boards", boardId);
  const updateData: any = { status, updatedAt: serverTimestamp() };
  if (status === "approved") {
    updateData.approvedAt = serverTimestamp();
  }
  await updateDoc(boardRef, updateData);
};

// 4. 게시판 소프트 삭제 (휴지통 기능 - 1주일 보관 후 완전 삭제용 표기)
export const deleteBoard = async (boardId: string) => {
  const boardRef = doc(db, "boards", boardId);
  await updateDoc(boardRef, { 
    status: "deleted",
    deletedAt: serverTimestamp(),
    updatedAt: serverTimestamp() 
  });
};

// 4-1. 게시판 복원 (휴지통에서 되돌리기)
export const restoreBoard = async (boardId: string) => {
  const boardRef = doc(db, "boards", boardId);
  await updateDoc(boardRef, { 
    status: "pending_feedback",
    updatedAt: serverTimestamp() 
  });
};

// 5. 게시판 영구 삭제 (완전 삭제)
export const permanentDeleteBoard = async (boardId: string) => {
  const boardRef = doc(db, "boards", boardId);
  await deleteDoc(boardRef);
};

// 6. 읽지 않은 메시지 초기화 (관리자 보드 진입시 호출)
export const resetUnreadMessages = async (boardId: string) => {
  const boardRef = doc(db, "boards", boardId);
  await updateDoc(boardRef, { unreadMessages: 0 });
};

// 7. 고객 수정 요청 반영 (상태 변경)
export const requestEdit = async (boardId: string) => {
  const boardRef = doc(db, "boards", boardId);
  await updateDoc(boardRef, { 
    status: "edit_requested", 
    updatedAt: serverTimestamp() 
  });
  await sendMessage(boardId, "system", "📢 고객이 시안에 대한 수정을 요청했습니다.", undefined);
};

// 8. 메시지 삭제
export const deleteMessage = async (boardId: string, messageId: string) => {
  const messageRef = doc(db, "boards", boardId, "messages", messageId);
  await deleteDoc(messageRef);
};
