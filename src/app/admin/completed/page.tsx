"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, CheckCircle, Calendar } from "lucide-react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { Board } from "../../../lib/services";
import { formatDistanceToNow, format } from "date-fns";
import { ko } from "date-fns/locale";

export default function AdminCompletedPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "boards"), orderBy("updatedAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbBoards: Board[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as Board;
        if (data.status === "approved") {
          dbBoards.push({ id: doc.id, ...data });
        }
      });
      setBoards(dbBoards);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "";
    if (timestamp.toDate) return formatDistanceToNow(timestamp.toDate(), { addSuffix: true, locale: ko });
    if (timestamp.seconds) return formatDistanceToNow(new Date(timestamp.seconds * 1000), { addSuffix: true, locale: ko });
    return "";
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "-";
    if (timestamp.toDate) return format(timestamp.toDate(), "yyyy.MM.dd HH:mm");
    if (timestamp.seconds) return format(new Date(timestamp.seconds * 1000), "yyyy.MM.dd HH:mm");
    return "-";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight flex items-center">
            <CheckCircle className="w-8 h-8 mr-3 text-emerald-500" />
            작업 완료
          </h2>
          <p className="text-neutral-400 mt-2 text-sm">고객이 최종 승인하여 모든 처리가 끝난 게시판 목록입니다.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-neutral-500">데이터를 불러오는 중입니다...</div>
      ) : boards.length === 0 ? (
        <div className="text-center py-20 bg-neutral-900 border border-neutral-800 rounded-2xl">
          <p className="text-neutral-400">최종 승인된 게시판이 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {boards.map((board) => (
            <div
              key={board.id}
              className="bg-neutral-900 border border-emerald-500/20 rounded-2xl overflow-hidden hover:border-emerald-500/40 transition-all flex flex-col"
            >
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-medium px-2.5 py-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                    승인 완료됨
                  </span>
                  <span className="text-xs text-neutral-500 bg-neutral-800 px-2 py-1 rounded-md">
                    총 {board.currentVersion}차 시안
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white leading-tight mb-1">{board.projectName}</h3>
                <p className="text-sm text-neutral-400">{board.clientName}</p>
                
                <div className="flex flex-col mt-5 space-y-1.5">
                  <div className="flex items-center text-xs text-neutral-400">
                    <Calendar className="w-3 h-3 mr-1.5" />
                    <span>시작일: {formatDate(board.createdAt)}</span>
                  </div>
                  <div className="flex items-center text-xs text-emerald-500/80 font-medium">
                    <CheckCircle className="w-3 h-3 mr-1.5" />
                    <span>완료일: {formatDate(board.approvedAt || board.updatedAt)}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-neutral-800 grid grid-cols-1 text-sm bg-neutral-900/50">
                <Link
                  href={`/admin/board/${board.id}`}
                  className="flex items-center justify-center space-x-2 py-3 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors font-medium"
                >
                  <span>게시판 열람 (읽기 전용)</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
