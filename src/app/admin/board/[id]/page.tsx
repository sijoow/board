"use client";

import { useState, useEffect, use, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, MessageSquare, Image as ImageIcon, ArrowRight, Upload, Layers, Trash2, MapPin, CheckCircle, X, Maximize, AlertCircle } from "lucide-react";
import { doc, collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../../../lib/firebase";
import { sendMessage, uploadNewVersion, deleteBoard, Board, Message, resetUnreadMessages, deleteMessage } from "../../../../lib/services";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export default function AdminBoardDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [board, setBoard] = useState<Board | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedVersion, setSelectedVersion] = useState<number>(1);
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // 이미지 압축 헬퍼
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 1200;
          let width = img.width;
          let height = img.height;
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.6));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const [isFullscreen, setIsFullscreen] = useState(false);
  useEffect(() => {
    resetUnreadMessages(id);
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
    await sendMessage(id, "admin", text, selectedVersion);
  };

  const handleUploadClick = () => {
    if (!board) return;
    const nextVersion = board.currentVersion + 1;
    if (confirm(`새로운 시안을 첨부하여 '${nextVersion}차 시안'으로 판올림 하시겠습니까?\n이 과정은 실제 로컬 파일 선택 창을 띄우며 화려한 업로드 UI 이펙트가 재생됩니다.`)) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !board) return;

    setIsUploading(true);
    setUploadProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 5;
      if (progress >= 100) {
        clearInterval(interval);
        setUploadProgress(100);
        setTimeout(async () => {
           const nextVersion = board.currentVersion + 1;
           const compressedBase64Array = await Promise.all(Array.from(files).map(f => compressImage(f)));
           await uploadNewVersion(id, nextVersion, compressedBase64Array);
           setIsUploading(false);
           setSelectedVersion(nextVersion);
        }, 500);
      } else {
        setUploadProgress(progress);
      }
    }, 250);
    e.target.value = '';
  };

  const handleDeleteBoard = async () => {
    if (confirm("정말 이 게시판을 휴지통으로 이동시키시겠습니까?")) {
      await deleteBoard(id);
      alert("게시판이 삭제되었습니다.");
      router.push("/admin/trash");
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (confirm("이 관리자 안내 메시지를 삭제하시겠습니까?")) {
      await deleteMessage(id, msgId);
    }
  };

  if (notFound) {
    return (
      <div className="p-8 text-neutral-500 flex flex-col items-center justify-center h-screen space-y-4 bg-neutral-50 dark:bg-neutral-950">
        <AlertCircle className="w-12 h-12 text-rose-500" />
        <p className="text-lg font-bold text-neutral-900 dark:text-white">존재하지 않거나 삭제된 게시판입니다.</p>
        <button onClick={() => router.push('/admin')} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-colors">
          대시보드로 돌아가기
        </button>
      </div>
    );
  }

  if (!board) return <div className="p-8 text-neutral-500 flex items-center justify-center h-screen">데이터를 불러오는 중입니다...</div>;

  const versions = Array.from({ length: board.currentVersion }, (_, i) => i + 1);
  const currentMarkers = messages.filter(m => m.targetVersion === selectedVersion && m.pinX !== undefined);

  const currentImagesRaw = board.images?.[selectedVersion.toString()];
  const currentImages = Array.isArray(currentImagesRaw) 
    ? currentImagesRaw 
    : currentImagesRaw 
      ? [currentImagesRaw] 
      : [`/draft${Math.min(selectedVersion, 3)}.jpg`];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <input type="file" multiple accept="image/*,application/pdf" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
      
      {isUploading && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 w-[400px] text-center shadow-2xl">
             <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-indigo-400 animate-bounce" />
             </div>
             <h3 className="text-xl font-bold text-white mb-2">프리미엄 시안 업로드 중...</h3>
             <p className="text-neutral-400 text-sm mb-8">고객에게 전달할 최고 품질의 결과물을 암호화하여 전송하고 있습니다.</p>
             <div className="w-full bg-neutral-800 rounded-full h-4 mb-4 overflow-hidden border border-neutral-700">
               <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-4 rounded-full transition-all duration-[250ms] ease-out shadow-[0_0_15px_rgba(99,102,241,0.5)]" style={{ width: `${uploadProgress}%` }}></div>
             </div>
             <span className="text-indigo-400 font-bold tracking-widest">{uploadProgress}% 완료</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pb-6 border-b border-neutral-200 dark:border-neutral-800 mb-6 shrink-0 transition-colors">
        <div>
          <Link href="/admin" className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white mb-2 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            대시보드로 돌아가기
          </Link>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center space-x-3 transition-colors">
            <span>{board.projectName}</span>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
               board.status === "approved"
               ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
               : board.status === "pending_feedback"
               ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
               : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
            }`}>
              {board.status === "approved" && "승인 완료"}
              {board.status === "pending_feedback" && "피드백 대기중"}
              {board.status === "in_progress" && "작업 진행중"}
            </span>
            <span className="bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-300 text-xs px-2 py-1 rounded-md">현재 {board.currentVersion}차 시안</span>
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1 text-sm">고객: {board.clientName} • 게시판 ID: {id}</p>
        </div>
        
        <div className="flex space-x-3 items-center">
          <button 
            onClick={handleUploadClick}
            className="flex items-center space-x-1 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-white text-sm font-medium rounded-lg transition-colors border border-neutral-200 dark:border-neutral-700"
          >
            <Upload className="w-4 h-4 mr-1"/>
            새 시안 등록 (버전업)
          </button>
          <a
            href={`/board/${id}`}
            target="_blank"
            className="flex items-center space-x-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
          >
            고객 화면으로 보기
          </a>
          <button
            onClick={handleDeleteBoard}
            className="flex items-center space-x-1 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-500 text-sm font-medium rounded-lg transition-colors border border-rose-500/20 ml-2"
            title="게시판 영구 삭제"
          >
            <Trash2 className="w-4 h-4" />
            <span className="sr-only">삭제</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 gap-4 lg:gap-6 min-h-0 lg:overflow-hidden overflow-y-auto pb-4 lg:pb-0">
        <div className="flex-1 lg:overflow-y-auto bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl flex flex-col transition-colors min-h-[500px] lg:min-h-0 shrink-0">
          
          <div className="bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 transition-colors">
             <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
               <span className="text-xs text-neutral-500 font-bold mr-1 flex items-center shrink-0">
                 <Layers className="w-4 h-4 mr-1"/> 버전:
               </span>
               {versions.map((v) => (
                 <button
                   key={v}
                   onClick={() => {
                     setSelectedVersion(v);
                   }}
                   className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                     selectedVersion === v 
                     ? "bg-indigo-600 text-white shadow-md"
                     : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700"
                   }`}
                 >
                   {v}차 시안
                 </button>
               ))}
             </div>
             <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-3">
                <span className="hidden xl:flex bg-neutral-800/10 dark:bg-neutral-900/90 text-neutral-700 dark:text-neutral-300 text-xs font-semibold px-3 py-1.5 rounded-full items-center pointer-events-none whitespace-nowrap">
                  <MapPin className="w-3.5 h-3.5 mr-1.5 text-rose-500" />
                  고객의 피드백 위치를 확인하세요.
                </span>
                <button
                  onClick={() => setIsFullscreen(true)}
                  className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-1.5 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-lg transition-colors text-sm font-bold shadow-sm border border-neutral-200 dark:border-neutral-700 whitespace-nowrap"
                >
                  <Maximize className="w-4 h-4" />
                  <span>전체화면 보기</span>
                </button>
             </div>
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto bg-neutral-100 dark:bg-neutral-900/50 flex flex-col items-center justify-start transition-colors space-y-12 pb-32">
            {currentImages.map((imgSrc, imgIdx) => (
             <div 
               key={imgIdx}
               className="relative w-full max-w-lg bg-white shadow-2xl shrink-0 self-center"
               style={{ minHeight: '600px' }}
             >
                {currentImages.length > 1 && (
                  <div className="absolute top-0 right-0 z-20 bg-neutral-900/90 text-white px-3 py-1.5 text-xs font-bold rounded-bl-xl pointer-events-none backdrop-blur-sm shadow-md border-l border-b border-neutral-700">
                    {imgIdx + 1} / {currentImages.length} 컷
                  </div>
                )}
                <img 
                  src={imgSrc}
                  alt={`${selectedVersion}차 시안 관리자뷰 - ${imgIdx + 1}`}
                  className="w-full block select-none pointer-events-none border border-neutral-200 dark:border-neutral-800 rounded-sm"
                />
                
                {currentMarkers.filter(m => (m.imageIndex || 0) === imgIdx).map(m => (
                  <div 
                    key={m.id}
                    className="absolute w-7 h-7 -ml-3.5 -mt-3.5 bg-rose-500 text-white rounded-full flex items-center justify-center font-bold text-xs shadow-lg border-2 border-white cursor-pointer hover:scale-110 transition-transform group"
                    style={{ left: `${m.pinX}%`, top: `${m.pinY}%` }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {m.pinIndex}
                    
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
                      [고객 요청] {m.text}
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-neutral-900 rotate-45"></div>
                    </div>
                  </div>
                ))}
             </div>
            ))}
          </div>
        </div>

        <div className="w-full lg:w-[350px] xl:w-[400px] h-[500px] lg:h-auto bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl flex flex-col overflow-hidden text-sm transition-colors shrink-0">
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 flex items-center space-x-2 text-neutral-900 dark:text-white font-bold shrink-0 transition-colors">
            <MessageSquare className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            <h3>고객 라이브 채팅</h3>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto space-y-6 bg-neutral-50 dark:bg-neutral-950/50 transition-colors">
            {messages.length === 0 && (
              <p className="text-center text-neutral-400 dark:text-neutral-500 mt-10">아직 메시지가 없습니다.</p>
            )}
            
            {messages.map((msg) => {
              const isAdmin = msg.sender === "admin";
              const isSystem = msg.sender === "system";
              const dateStr = msg.createdAt?.toDate ? format(msg.createdAt.toDate(), "a h:mm", { locale: ko }) : (msg.createdAt?.seconds ? format(new Date(msg.createdAt.seconds * 1000), "a h:mm", { locale: ko }) : "");
              const hasPin = msg.pinX !== undefined;
              
              if (isSystem) {
                return (
                  <div key={msg.id} className="flex flex-col items-center my-6">
                     <span className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 text-xs px-4 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-500/20 font-semibold shadow-sm">
                       {msg.text}
                     </span>
                  </div>
                );
              }

              return (
                <div key={msg.id} className={`flex flex-col ${isAdmin ? "items-end self-end ml-auto" : "items-start"} max-w-[85%]`}>
                  <span className={`text-xs text-neutral-400 dark:text-neutral-500 mb-1 ${isAdmin ? "mr-1" : "ml-1"}`}>
                    {isAdmin ? "관리자(나)" : "고객"} • {dateStr}
                  </span>
                  <div className={`px-4 py-2.5 shadow-sm text-sm border ${
                    isAdmin 
                    ? "bg-indigo-600 border-indigo-500 text-white rounded-2xl rounded-tr-sm shadow-indigo-500/10" 
                    : "bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-2xl rounded-tl-sm shadow-sm"
                  }`}>
                    {hasPin && (
                      <span className={`inline-flex items-center justify-center ${isAdmin ? 'bg-indigo-800' : 'bg-rose-500'} text-white text-[10px] font-bold w-5 h-5 rounded-full mr-2 shadow-sm`}>
                        {msg.pinIndex}
                      </span>
                    )}
                    {msg.text}
                  </div>
                  {isAdmin && (
                     <button 
                       onClick={() => handleDeleteMessage(msg.id!)}
                       className="text-neutral-400 dark:text-neutral-500 hover:text-rose-500 dark:hover:text-rose-400 mt-1 mr-1 text-[10px] font-semibold transition-colors flex items-center"
                     >
                       <X className="w-3 h-3 mr-0.5" /> 삭제
                     </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 shrink-0 transition-colors">
            <div className="text-xs text-neutral-400 dark:text-neutral-500 mb-2">
              <span>채팅은 현재 <strong>전체 히스토리</strong>를 보여줍니다.</span>
            </div>
            <form onSubmit={handleSend} className="relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="고객에게 보낼 메시지를 입력하세요..."
                className="w-full bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-full pl-4 pr-12 py-3 text-neutral-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
              />
              <button 
                type="submit"
                disabled={!newMessage.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-500 disabled:bg-neutral-200 dark:disabled:bg-neutral-700 disabled:text-neutral-400 hover:bg-indigo-400 text-white p-1.5 rounded-full transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Fullscreen TV Mode */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[200] bg-black flex flex-col animate-in fade-in duration-200">
          <div className="p-4 flex justify-between items-center bg-transparent text-white absolute top-0 left-0 right-0 z-10 pointer-events-none">
            <span className="font-bold text-lg pointer-events-auto bg-black/60 px-4 py-2 rounded-xl backdrop-blur-md">
              {board.projectName} - {selectedVersion}차 시안 (전체화면 모드)
            </span>
            <button 
              onClick={() => setIsFullscreen(false)} 
              className="bg-black/60 hover:bg-rose-600 p-3 rounded-xl transition-colors pointer-events-auto backdrop-blur-md border border-neutral-800"
              title="닫기 (ESC)"
            >
               <X className="w-6 h-6" />
            </button>
          </div>
          <div 
             className="flex-1 w-full h-full flex flex-col items-center justify-start p-8 bg-black cursor-zoom-out overflow-y-auto space-y-12 pb-32"
             onClick={() => setIsFullscreen(false)}
          >
             {currentImages.map((src, idx) => (
               <img 
                 key={idx}
                 src={src}
                 alt={`전체화면 ${idx + 1}`}
                 className="max-w-full h-auto object-contain pointer-events-none shadow-2xl"
               />
             ))}
          </div>
        </div>
      )}
    </div>
  );
}
