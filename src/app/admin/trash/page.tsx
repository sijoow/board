"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { Board, permanentDeleteBoard, restoreBoard } from "../../../lib/services";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Trash2, RefreshCw, AlertCircle } from "lucide-react";

export default function TrashDesktop() {
  const [deletedBoards, setDeletedBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "boards"), orderBy("deletedAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const boards: Board[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as Board;
        if (data.status === "deleted") {
          boards.push({ id: doc.id, ...data });
        }
      });
      setDeletedBoards(boards);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handlePermanentDelete = async (id: string, projectName: string) => {
    if (confirm(`'${projectName}' 게시판을 영구적으로 삭제하시겠습니까?\n이 작업은 Firebase 데이터베이스에서도 파기되어 절대 복구할 수 없습니다.`)) {
      await permanentDeleteBoard(id);
      alert("영구 삭제되었습니다.");
    }
  };

  const handleRestore = async (id: string, projectName: string) => {
    if (confirm(`'${projectName}' 게시판을 대시보드로 다시 복원하시겠습니까?`)) {
      await restoreBoard(id);
      alert("복원되었습니다.");
    }
  };

  if (loading) {
    return <div className="p-8 text-neutral-500 font-medium">휴지통 데이터를 불러오는 중...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white flex items-center">
          <Trash2 className="w-8 h-8 mr-3 text-rose-500" /> 
          휴지통
        </h2>
        <p className="text-neutral-500 dark:text-neutral-400 mt-2">
          삭제된 게시판 보관소입니다. (여기서 영구 삭제 시 실제 데이터베이스에서 파기됩니다)
        </p>
      </div>

      {deletedBoards.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-12 text-center shadow-sm">
          <AlertCircle className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
          <p className="text-lg text-neutral-500 font-medium">휴지통이 비어있습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {deletedBoards.map((board) => (
            <div key={board.id} className="bg-rose-50/50 dark:bg-neutral-900/50 border border-rose-100 dark:border-rose-900/30 rounded-2xl p-6 transition-all shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white">{board.projectName}</h3>
                  <p className="text-neutral-500 text-sm mt-1">고객: {board.clientName}</p>
                </div>
                <span className="bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 text-xs px-2.5 py-1 rounded-full font-bold border border-rose-200 dark:border-rose-500/20">
                  삭제됨
                </span>
              </div>
              
              <div className="text-xs text-neutral-400 dark:text-neutral-500 space-y-1 mb-6">
                <p>최종 시안: {board.currentVersion}차</p>
                {board.deletedAt && (
                  <p>삭제 일시: {board.deletedAt?.toDate ? format(board.deletedAt.toDate(), "M월 d일 a h:mm", { locale: ko }) : (board.deletedAt?.seconds ? format(new Date(board.deletedAt.seconds * 1000), "M월 d일 a h:mm", { locale: ko }) : "-")}</p>
                )}
              </div>

              <div className="flex space-x-3 pt-4 border-t border-rose-200/50 dark:border-neutral-800">
                <button
                  onClick={() => handleRestore(board.id!, board.projectName)}
                  className="flex-1 flex items-center justify-center space-x-2 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-xl text-sm font-bold transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>대시보드로 복원</span>
                </button>
                <button
                  onClick={() => handlePermanentDelete(board.id!, board.projectName)}
                  className="flex-1 flex items-center justify-center space-x-2 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-bold shadow shadow-rose-500/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>단일 영구 삭제</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
