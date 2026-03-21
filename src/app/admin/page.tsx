"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, ExternalLink, MessageCircle, LayoutGrid, List as ListIcon, Trash2, Calendar } from "lucide-react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Board, deleteBoard } from "../../lib/services";
import { formatDistanceToNow, format } from "date-fns";
import { ko } from "date-fns/locale";

export default function AdminDashboard() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  useEffect(() => {
    const q = query(collection(db, "boards"), orderBy("updatedAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbBoards: Board[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as Board;
        if (data.status !== "deleted" && data.status !== "approved") {
          dbBoards.push({ id: doc.id, ...data });
        }
      });
      setBoards(dbBoards);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "방금 전";
    if (timestamp.toDate) return formatDistanceToNow(timestamp.toDate(), { addSuffix: true, locale: ko });
    if (timestamp.seconds) return formatDistanceToNow(new Date(timestamp.seconds * 1000), { addSuffix: true, locale: ko });
    return "방금 전";
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "-";
    if (timestamp.toDate) return format(timestamp.toDate(), "yyyy.MM.dd HH:mm");
    if (timestamp.seconds) return format(new Date(timestamp.seconds * 1000), "yyyy.MM.dd HH:mm");
    return "-";
  };

  const handleDelete = async (e: React.MouseEvent, boardId: string, projectName: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(`'${projectName}' 게시판을 삭제하시겠습니까?\n삭제된 게시판은 휴지통으로 즉시 이동합니다.`)) {
      await deleteBoard(boardId);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "edit_requested":
        return <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-medium px-2.5 py-1 rounded-full text-xs">수정 요청됨</span>;
      case "pending_feedback":
        return <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-medium px-2.5 py-1 rounded-full text-xs">피드백 대기중</span>;
      case "in_progress":
        return <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-medium px-2.5 py-1 rounded-full text-xs">작업 진행중</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">진행 중인 작업</h2>
          <p className="text-neutral-500 dark:text-neutral-400 mt-2 text-sm">고객 피드백을 확인하고 수정 요청을 처리하세요.</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex bg-neutral-200 dark:bg-neutral-800 p-1 rounded-lg">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-colors ${viewMode === "grid" ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm" : "text-neutral-500 hover:text-neutral-700 dark:hover:text-white"}`}
              title="격자형 보기"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-colors ${viewMode === "list" ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm" : "text-neutral-500 hover:text-neutral-700 dark:hover:text-white"}`}
              title="리스트형 보기"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
          <Link
            href="/admin/new"
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center shadow-lg shadow-indigo-500/20"
          >
            새 게시판 생성
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-neutral-500">데이터를 불러오는 중입니다...</div>
      ) : boards.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm">
          <p className="text-neutral-500 dark:text-neutral-400 mb-4">현재 진행 중인 작업 게시판이 없습니다.</p>
          <Link href="/admin/new" className="text-indigo-500 hover:text-indigo-400 font-medium">
            첫 번째 시안 게시판 만들기 &rarr;
          </Link>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {boards.map((board) => (
            <div
              key={board.id}
              className={`bg-white dark:bg-neutral-900 border rounded-2xl overflow-hidden transition-all flex flex-col shadow-sm ${
                board.unreadMessages > 0 
                ? 'border-2 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.15)] dark:shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:border-rose-400 transform -translate-y-1' 
                : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex space-x-2">
                    {getStatusBadge(board.status)}
                    {board.unreadMessages > 0 && (
                      <span className="animate-pulse flex items-center space-x-1 text-xs font-bold text-white bg-rose-600 px-3 py-1 rounded-full border border-rose-400 shadow-md">
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>새 피드백</span>
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, board.id!, board.projectName)}
                    className="text-neutral-400 hover:text-rose-500 transition-colors hover:bg-rose-50 dark:hover:bg-rose-500/10 p-1.5 rounded-lg"
                    title="게시판 삭제"
                  >
                     <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white leading-tight mb-1">{board.projectName}</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{board.clientName}</p>
                
                <div className="flex flex-col space-y-1.5 mt-5">
                  <div className="flex items-center text-xs text-neutral-500 dark:text-neutral-400">
                    <Calendar className="w-3 h-3 mr-1.5" />
                    <span>작업 시작일: {formatDate(board.createdAt)}</span>
                  </div>
                  <div className="flex items-center text-xs text-neutral-400 dark:text-neutral-500">
                    <Clock className="w-3 h-3 mr-1.5" />
                    <span>최근 업데이트: {formatTime(board.updatedAt)}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-neutral-100 dark:border-neutral-800 grid grid-cols-2 text-sm divide-x divide-neutral-100 dark:divide-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                <Link
                  href={`/admin/board/${board.id}`}
                  className="flex items-center justify-center space-x-2 py-3 text-neutral-600 dark:text-neutral-300 hover:text-indigo-600 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors font-medium"
                >
                  <span>게시판 관리</span>
                </Link>
                <Link
                  href={`/board/${board.id}`}
                  target="_blank"
                  className="flex items-center justify-center space-x-2 py-3 text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors font-medium"
                >
                  <span>고객용 URL</span>
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm whitespace-nowrap min-w-[700px]">
              <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="px-6 py-4 font-medium">프로젝트명</th>
                  <th className="px-6 py-4 font-medium">고객명</th>
                  <th className="px-6 py-4 font-medium">시작일</th>
                  <th className="px-6 py-4 font-medium">버전</th>
                  <th className="px-6 py-4 font-medium">진행 상태</th>
                  <th className="px-6 py-4 font-medium">메시지</th>
                  <th className="px-6 py-4 font-medium text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 text-neutral-700 dark:text-neutral-300">
                {boards.map((board) => (
                  <tr key={board.id} className={`hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors ${board.unreadMessages > 0 ? 'bg-rose-50/10 dark:bg-rose-900/10' : ''}`}>
                    <td className="px-6 py-4 font-bold text-neutral-900 dark:text-white truncate max-w-[200px]">{board.projectName}</td>
                    <td className="px-6 py-4 truncate max-w-[150px]">{board.clientName}</td>
                    <td className="px-6 py-4 text-xs text-neutral-500 font-mono">{formatDate(board.createdAt)}</td>
                    <td className="px-6 py-4 text-neutral-500">{board.currentVersion}차</td>
                    <td className="px-6 py-4">{getStatusBadge(board.status)}</td>
                    <td className="px-6 py-4">
                      {board.unreadMessages > 0 ? (
                        <span className="flex w-max items-center space-x-1 text-xs font-bold text-white bg-rose-600 px-2.5 py-1 rounded-full shadow-sm animate-pulse">
                          <MessageCircle className="w-3 h-3" />
                          <span>새 피드백</span>
                        </span>
                      ) : (
                         <span className="text-neutral-400 dark:text-neutral-600">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/admin/board/${board.id}`}
                          className="inline-flex items-center justify-center px-4 py-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white rounded-lg transition-colors font-medium text-xs border border-transparent hover:border-neutral-300 dark:hover:border-neutral-600"
                        >
                          관리
                        </Link>
                        <button
                          onClick={(e) => handleDelete(e, board.id!, board.projectName)}
                          className="inline-flex items-center justify-center p-1.5 bg-white dark:bg-neutral-900 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-neutral-400 hover:text-rose-500 rounded-lg transition-colors border border-transparent hover:border-rose-200 dark:hover:border-rose-500/30"
                          title="게시판 삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
