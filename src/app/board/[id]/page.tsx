"use client";

import { useState, useEffect, use } from "react";
import { CheckCircle, AlertCircle, MessageSquare, Image as ImageIcon, Download, Send, Layers, MapPin, X, Maximize } from "lucide-react";
import { doc, collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { sendMessage, updateBoardStatus, Board, Message, requestEdit, deleteMessage } from "../../../lib/services";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export default function ClientBoardView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const [board, setBoard] = useState<Board | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedVersion, setSelectedVersion] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // 핀 찍기 상태
  const [newPin, setNewPin] = useState<{ x: number, y: number, imageIndex: number } | null>(null);
  const [pinMessage, setPinMessage] = useState("");

  useEffect(() => {
    const boardRef = doc(db, "boards", id);
    const unsubBoard = onSnapshot(boardRef, (docSnap) => {
      if (docSnap.exists()) {
        const boardData = { id: docSnap.id, ...docSnap.data() } as Board;
        if (!boardData.currentVersion) boardData.currentVersion = 1;
        setBoard(boardData);
        setSelectedVersion(boardData.currentVersion);
      } else {
        setNotFound(true);
      }
    });

    const messagesRef = collection(db, "boards", id, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));
    const unsubMessages = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = [];
      snapshot.forEach((d) => msgs.push({ id: d.id, ...d.data() } as Message));
      setMessages(msgs);
    });

    return () => {
      unsubBoard();
      unsubMessages();
    };
  }, [id]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !board) return;
    const text = newMessage;
    setNewMessage("");
    await sendMessage(id, "client", text, selectedVersion);
    
    if (board?.status === "approved") {
       await updateBoardStatus(id, "pending_feedback");
    }
  };

  const handleApprove = async () => {
    if (confirm(`현재 보고 계신 ${selectedVersion}차 시안을 최종 승인하시겠습니까?\n승인 후에는 수정이 불가능합니다.`)) {
      await updateBoardStatus(id, "approved");
      await sendMessage(id, "client", `[시스템] 고객님이 ${selectedVersion}차 시안을 최종 승인하였습니다. 🎉`, selectedVersion);
    }
  };

  const handleRequestEdit = async () => {
    if (board?.status === "edit_requested") return;
    if (confirm(`수정 필요 사항을 핀(Pin) 코멘트나 채팅으로 모두 남기셨나요?\n\n'수정 요청' 상태로 변경하여 인쇄소에 알림을 보냅니다.`)) {
       await requestEdit(id);
    }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>, imgIdx: number) => {
    // 이미지가 아닌 입력창 클릭은 무시
    if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).closest('.pin-popup')) {
      return;
    }
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width * 100;
    const y = (e.clientY - rect.top) / rect.height * 100;
    
    setNewPin({ x, y, imageIndex: imgIdx });
    setPinMessage("");
  };

  const submitPin = async () => {
    if (!newPin || !pinMessage.trim() || !board) return;
    
    // 현재 버전의 기존 핀 개수를 세어 다음 번호 할당
    const currentVersionPins = messages.filter(m => m.targetVersion === selectedVersion && m.pinX !== undefined);
    const pinIndex = currentVersionPins.length + 1;

    await sendMessage(id, "client", pinMessage, selectedVersion, newPin.x, newPin.y, pinIndex, newPin.imageIndex);
    
    setNewPin(null);
    setPinMessage("");
    
    if (board?.status === "approved") {
      await updateBoardStatus(id, "pending_feedback");
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (confirm("이 코멘트/핀을 정말 삭제하시겠습니까?")) {
      await deleteMessage(id, msgId);
    }
  };

  if (notFound) {
    return (
      <div className="p-8 text-neutral-500 h-screen flex flex-col items-center justify-center bg-neutral-950 space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500" />
        <p className="text-lg font-bold text-white">존재하지 않거나 삭제된 게시판입니다.</p>
        <p className="text-sm text-neutral-400">잘못된 링크이거나 관리자가 프로젝트를 삭제했을 수 있습니다.</p>
      </div>
    );
  }

  if (!board) return <div className="p-8 text-neutral-500 h-screen flex items-center justify-center bg-neutral-950 text-white">데이터를 불러오는 중입니다...</div>;

  const versions = Array.from({ length: board.currentVersion }, (_, i) => i + 1);
  const currentMarkers = messages.filter(m => m.targetVersion === selectedVersion && m.pinX !== undefined);
  
  const currentImagesRaw = board.images?.[selectedVersion.toString()];
  const currentImages = Array.isArray(currentImagesRaw) 
    ? currentImagesRaw 
    : currentImagesRaw 
      ? [currentImagesRaw] 
      : [`/draft${Math.min(selectedVersion, 3)}.jpg`];

  return (
    <div className="flex flex-col min-h-screen bg-neutral-950 text-neutral-100 font-sans">
      <header className="h-16 flex items-center justify-between px-6 border-b border-neutral-800 bg-neutral-900 shadow-sm z-10 sticky top-0">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold">
            P
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">{board.projectName}</h1>
            <p className="text-xs text-neutral-400">게시판 ID: {id}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
             onClick={handleRequestEdit}
             disabled={board.status === 'approved' || board.status === 'edit_requested'}
             className="hidden sm:flex items-center space-x-2 px-4 py-2 border border-neutral-700 disabled:opacity-50 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-xl text-sm font-medium transition-colors"
          >
            <AlertCircle className="w-4 h-4" />
            <span>{board.status === 'edit_requested' ? "수정 요청 완료" : "수정 요청"}</span>
          </button>
          <button 
            onClick={handleApprove}
            disabled={board.status === 'approved'}
            className="flex items-center space-x-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-emerald-500/20"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{board.status === "approved" ? "최종 승인됨" : "현재 시안으로 최종 승인"}</span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        <section className="flex-1 flex flex-col bg-neutral-950 border-r border-neutral-800 relative">
          <div className="w-full bg-neutral-900 border-b border-neutral-800 px-6 flex items-center space-x-2 overflow-x-auto py-3 shrink-0">
            <span className="text-xs text-neutral-500 font-bold mr-2 flex items-center">
              <Layers className="w-4 h-4 mr-1"/> 시안 히스토리:
            </span>
            {versions.map((v) => (
              <button
                key={v}
                onClick={() => {
                  setSelectedVersion(v);
                  setNewPin(null);
                }}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                  selectedVersion === v 
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-neutral-800/50 text-neutral-400 hover:text-white hover:bg-neutral-700 border border-neutral-800"
                }`}
              >
                {v}차 시안 {v === board.currentVersion && "(최신)"}
              </button>
            ))}
          </div>

          <div className="absolute top-20 left-4 right-4 z-10 flex items-center justify-between">
            <span className="bg-neutral-900/90 backdrop-blur-sm border border-neutral-800 text-neutral-300 text-xs font-semibold px-4 py-2 rounded-full flex items-center shadow-lg pointer-events-none">
              <MapPin className="w-3.5 h-3.5 mr-2 text-rose-500" />
              이미지를 클릭하여 피드백 핀을 남겨보세요!
            </span>
            <button
              onClick={() => setIsFullscreen(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-neutral-900/90 backdrop-blur-sm border border-neutral-700 hover:bg-neutral-800 text-neutral-200 rounded-full text-xs font-semibold shadow-lg transition-colors"
            >
              <Maximize className="w-3.5 h-3.5" />
              <span>원본보기</span>
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center p-8 overflow-auto CustomScrollbar bg-neutral-950 pb-32 space-y-12">
            {currentImages.map((imgSrc, imgIdx) => (
             <div 
               key={imgIdx}
               className="relative w-full max-w-2xl bg-white shadow-2xl shrink-0 cursor-crosshair flex flex-col"
               onClick={(e) => handleImageClick(e, imgIdx)}
               style={{ minHeight: '600px' }}
             >
                {/* 다중 이미지 시안 순번 라벨 */}
                {currentImages.length > 1 && (
                  <div className="absolute top-0 right-0 z-20 bg-neutral-900/90 text-white px-3 py-1.5 text-xs font-bold rounded-bl-xl border-l border-b border-neutral-700 pointer-events-none backdrop-blur-sm shadow-md">
                    {imgIdx + 1} / {currentImages.length} 컷
                  </div>
                )}

                {/* 이미지 본체 */}
                <img 
                  src={imgSrc}
                  alt={`${selectedVersion}차 시안 - ${imgIdx + 1}번째 이미지`}
                  className="w-full block select-none pointer-events-none"
                />
                
                {/* 현재 이미지에 해당하는 렌더링된 과거 핀 마커들 */}
                {currentMarkers.filter(m => (m.imageIndex || 0) === imgIdx).map(m => (
                  <div 
                    key={m.id}
                    className="absolute w-8 h-8 -ml-4 -mt-4 bg-rose-500 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-[0_4px_10px_rgba(244,63,94,0.5)] border-2 border-white cursor-pointer hover:scale-110 transition-transform group"
                    style={{ left: `${m.pinX}%`, top: `${m.pinY}%` }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {m.pinIndex}
                    
                    {/* Tooltip */}
                    <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      {m.text}
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-neutral-900 rotate-45"></div>
                    </div>
                  </div>
                ))}
                
                {/* 현재 이미지에 새로 찍는 핀 팝업 */}
                {newPin && newPin.imageIndex === imgIdx && (
                   <div 
                     className="absolute z-40 pin-popup shadow-2xl"
                     style={{ left: `${newPin.x}%`, top: `${newPin.y}%` }}
                   >
                     <div className="w-8 h-8 -ml-4 -mt-4 bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-[0_4px_10px_rgba(99,102,241,0.5)] border-2 border-white animate-bounce pointer-events-none">
                       +
                     </div>
                     <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-neutral-900 border border-neutral-700 p-2 rounded-xl flex items-center space-x-2 w-64 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <input 
                          type="text"
                          autoFocus
                          value={pinMessage}
                          onChange={e => setPinMessage(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && submitPin()}
                          placeholder="이 위치에 남길 코멘트..."
                          className="flex-1 bg-neutral-950 border border-neutral-800 text-sm text-white px-3 py-1.5 rounded-lg focus:outline-none focus:border-indigo-500"
                        />
                        <button onClick={submitPin} className="p-1.5 bg-indigo-600 rounded-lg text-white hover:bg-indigo-500" title="저장">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button onClick={() => setNewPin(null)} className="p-1.5 bg-neutral-800 rounded-lg text-neutral-400 hover:text-white" title="취소">
                          <X className="w-4 h-4" />
                        </button>
                     </div>
                   </div>
                )}
             </div>
            ))}
          </div>
        </section>

        <aside className="w-full md:w-[400px] bg-neutral-900 flex flex-col h-[50vh] md:h-[calc(100vh-4rem)] border-t md:border-t-0 border-neutral-800">
          <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900 z-10 shrink-0">
            <h2 className="font-bold flex items-center text-white">
              <MessageSquare className="w-4 h-4 mr-2 text-indigo-400" />
              실시간 피드백
            </h2>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-neutral-950/30">
            <div className="text-center my-4">
              <span className="bg-neutral-800 text-neutral-400 text-xs px-3 py-1 rounded-full border border-neutral-700">
                인쇄소에서 1차 시안 게시판을 생성했습니다.
              </span>
            </div>

            {messages.map((msg) => {
              const dateStr = msg.createdAt?.toDate ? format(msg.createdAt.toDate(), "a h:mm", { locale: ko }) : (msg.createdAt?.seconds ? format(new Date(msg.createdAt.seconds * 1000), "a h:mm", { locale: ko }) : "");
              
              if (msg.sender === "system") {
                return (
                  <div key={msg.id} className="flex flex-col items-center my-6">
                     <span className="bg-indigo-500/10 text-indigo-300 text-xs px-4 py-1.5 rounded-full border border-indigo-500/20 font-semibold shadow-sm">
                       {msg.text}
                     </span>
                  </div>
                );
              }

              const isClient = msg.sender === "client";
              const hasPin = msg.pinX !== undefined;

              return (
                <div key={msg.id} className={`flex flex-col ${isClient ? "items-end self-end ml-auto" : "items-start"} max-w-[85%]`}>
                  <span className={`text-xs text-neutral-500 mb-1 ${isClient ? "mr-1" : "ml-1"} flex items-center`}>
                     {isClient ? "고객(나)" : "인쇄소"} • {dateStr}
                  </span>
                  <div className={`px-4 py-2.5 shadow-sm text-sm ${
                    isClient 
                    ? "bg-indigo-600 text-white rounded-2xl rounded-tr-sm shadow-indigo-500/10" 
                    : "bg-neutral-800 text-neutral-200 rounded-2xl rounded-tl-sm border border-neutral-700"
                  }`}>
                    {hasPin && (
                      <span className="inline-flex items-center justify-center bg-rose-500 text-white text-[10px] font-bold w-5 h-5 rounded-full mr-2 shadow-sm">
                        {msg.pinIndex}
                      </span>
                    )}
                    {msg.text}
                  </div>
                  {isClient && (
                     <button 
                       onClick={() => handleDeleteMessage(msg.id!)}
                       className="text-neutral-500 hover:text-rose-500 mt-1 mr-1 text-[10px] font-semibold transition-colors flex items-center"
                     >
                       <X className="w-3 h-3 mr-0.5" /> 삭제
                     </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-neutral-900 border-t border-neutral-800 shrink-0">
            <div className="text-xs text-neutral-500 mb-2 flex items-center justify-between">
              <span>현재 선택된 시안: <strong className="text-white">{selectedVersion}차</strong></span>
              {selectedVersion !== board.currentVersion && (
                <button onClick={() => setSelectedVersion(board.currentVersion)} className="text-indigo-400 hover:text-indigo-300 font-medium">최신 버전으로 이동</button>
              )}
            </div>
            <form onSubmit={handleSend} className="flex items-center justify-between bg-neutral-950 border border-neutral-700 rounded-xl p-1 pr-2 shadow-inner">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="전체 화면에 대한 피드백 입력..."
                className="flex-1 min-w-0 bg-transparent px-3 py-2 text-sm text-white focus:outline-none"
              />
              <button 
                type="submit"
                disabled={!newMessage.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white p-2 rounded-lg transition-colors shadow-sm shrink-0 ml-2"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </aside>

      </main>

      {/* 전체화면 원본보기 */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[200] bg-black flex flex-col animate-in fade-in duration-200">
          <div className="p-4 flex justify-between items-center absolute top-0 left-0 right-0 z-10 pointer-events-none">
            <span className="font-bold text-white text-sm pointer-events-auto bg-black/60 px-4 py-2 rounded-xl backdrop-blur-md">
              {board.projectName} — {selectedVersion}차 시안 원본보기
            </span>
            <button
              onClick={() => setIsFullscreen(false)}
              className="bg-black/60 hover:bg-rose-600 p-3 rounded-xl transition-colors pointer-events-auto backdrop-blur-md border border-neutral-800"
              title="닫기"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
          <div
            className="flex-1 w-full h-full flex flex-col items-center justify-start p-8 pt-20 bg-black cursor-zoom-out overflow-y-auto space-y-12 pb-32"
            onClick={() => setIsFullscreen(false)}
          >
            {currentImages.map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt={`원본 ${idx + 1}`}
                className="max-w-full h-auto object-contain pointer-events-none shadow-2xl"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
