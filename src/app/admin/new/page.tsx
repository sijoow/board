"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UploadCloud, ArrowRight, Upload, FileImage, X } from "lucide-react";
import { createBoard } from "../../../lib/services";

export default function NewBoard() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [projectName, setProjectName] = useState("");
  const [clientName, setClientName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 첫 번째 시안 파일 상태 (다중 지원)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // 가짜 업로드 UX 애니메이션 상태
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // 이미지 압축 헬퍼 함수
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 1200; // 최대 가로 픽셀
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
          // 0.6 퀄리티의 JPEG 형식 Base64 텍스트로 전환 (Firestore 저장 용량 절약)
          resolve(canvas.toDataURL("image/jpeg", 0.6));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  // 파일 강제 선택 팝업
  const handleBoxClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  // 드래그 앤 드롭 이벤트 핸들러
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFiles(prev => [...prev, ...Array.from(e.dataTransfer.files!)]);
    }
  };

  const removeFile = (e: React.MouseEvent, index: number) => {
    e.stopPropagation(); // 박스 클릭 이벤트 방지
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      alert("첫 번째 시안 이미지를 드래그하거나 더블클릭하여 하나 이상 등록해 주세요.");
      return;
    }
    
    setIsSubmitting(true);
    
    // 파일 업로드 가짜 로딩 UX 시작
    setIsUploading(true);
    setUploadProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 20) + 10;
      if (progress >= 100) {
        clearInterval(interval);
        setUploadProgress(100);
        finishSubmit();
      } else {
        setUploadProgress(progress);
      }
    }, 200);
  };

  const finishSubmit = async () => {
    try {
      if (selectedFiles.length === 0) return;
      
      // 다중 이미지 동시 압축
      const base64Images = await Promise.all(selectedFiles.map(compressImage));

      // Firebase Firestore에 데이터 및 Base64 이미지 배열 실제 저장
      const boardId = await createBoard(projectName, clientName, base64Images);
      
      setIsUploading(false);
      setTimeout(() => {
        alert("게시판 및 1차 시안이 성공적으로 등록되었습니다.");
        router.push(`/admin/board/${boardId}`);
      }, 100);
      
    } catch (error: any) {
      setIsUploading(false);
      console.error("게시판 생성 오류:", error);
      alert(`게시판 생성 실패: ${error.message}\n\n(Firestore 데이터베이스 연결 및 규칙을 확인해 주세요.)`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8">
      
      {/* 💥 전체화면 가짜 업로드 로딩 바 모달 💥 */}
      {isUploading && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 w-[400px] text-center shadow-2xl">
             <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-indigo-400 animate-bounce" />
             </div>
             <h3 className="text-xl font-bold text-white mb-2">프리미엄 게시판 인스턴스 생성 중...</h3>
             <p className="text-neutral-400 text-sm mb-8">고객 공간을 할당하고 총 {selectedFiles.length}개의 고화질 파일을 업로드하고 있습니다.</p>
             
             <div className="w-full bg-neutral-800 rounded-full h-4 mb-4 overflow-hidden border border-neutral-700">
               <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-4 rounded-full transition-all duration-[200ms] ease-out shadow-[0_0_15px_rgba(99,102,241,0.5)]" style={{ width: `${uploadProgress}%` }}></div>
             </div>
             <span className="text-indigo-400 font-bold tracking-widest">{uploadProgress}% 완료</span>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-white mb-2">새 게시판 생성</h2>
        <p className="text-neutral-400">고객에게 전달할 1차 시안을 업로드하고 피드백 통로를 만드세요.</p>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">작업명 (프로젝트명)</label>
              <input
                type="text"
                required
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="예: 제품 브로슈어 인쇄"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">고객명 또는 회사명</label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="예: (주)인쇄소 기업"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-300 mb-2 mt-4">1차 시안 파일 업로드</label>
              
              <input 
                type="file" 
                multiple
                accept="image/*,application/pdf" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
              />
              
              <div 
                onClick={handleBoxClick}
                onDoubleClick={handleBoxClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer group flex flex-col items-center justify-center min-h-[160px]
                  ${isDragging ? "border-indigo-500 bg-indigo-500/10" : "border-neutral-700 hover:border-indigo-500/50 hover:bg-neutral-800/50 bg-neutral-950"} 
                  ${selectedFiles.length > 0 ? "border-emerald-500/50 hover:border-emerald-500/80 bg-emerald-500/5" : ""} 
                `}
              >
                {selectedFiles.length === 0 ? (
                  <>
                    <UploadCloud className={`w-12 h-12 mx-auto mb-3 transition-colors ${isDragging ? "text-indigo-400" : "text-neutral-500 group-hover:text-indigo-400"}`} />
                    <p className="text-base text-neutral-300 font-medium">여기로 파일을 드래그하거나 더블클릭 하세요</p>
                    <p className="text-xs text-neutral-500 mt-2">여러 장 업로드 지원, JPG, PNG, PDF (최대 50MB)</p>
                  </>
                ) : (
                  <div className="w-full flex flex-col space-y-3">
                    {selectedFiles.map((file, idx) => (
                      <div key={idx} className="flex flex-row items-center justify-between bg-neutral-900 border border-neutral-800 px-4 py-3 rounded-xl">
                        <div className="flex items-center space-x-3 overflow-hidden">
                          <FileImage className="w-6 h-6 shrink-0 text-emerald-400" />
                          <div className="flex flex-col items-start truncate overflow-hidden text-left">
                            <p className="text-sm text-emerald-300 font-bold truncate max-w-[200px] sm:max-w-xs block">{file.name}</p>
                            <p className="text-[10px] text-neutral-500 block">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button 
                          type="button"
                          onClick={(e) => removeFile(e, idx)}
                          className="shrink-0 flex items-center justify-center text-xs font-semibold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-500 w-8 h-8 rounded-full transition-colors"
                          title="선택 취소"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <p className="text-xs text-indigo-400 font-medium pt-2">이 박스를 클릭하여 추가 시안 이미지를 더 선택할 수 있습니다.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-6 flex items-center justify-end space-x-4 border-t border-neutral-800">
            <Link href="/admin" className="text-neutral-400 hover:text-white text-sm font-medium transition-colors">
              취소
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || selectedFiles.length === 0}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:bg-neutral-800 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center space-x-2"
            >
              <span>{isSubmitting ? "생성 중..." : "게시판 생성하기"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
