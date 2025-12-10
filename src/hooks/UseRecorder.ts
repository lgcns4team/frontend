import { useState, useRef } from 'react';

// 녹음이 종료되었을 때 호출할 콜백 함수 타입 정의
type OnStopCallback = (blob: Blob) => void;


export const useRecorder = (onStopCallback?: OnStopCallback) => {
  // 1. 화면에 보여줄 상태
  const [isRecording, setIsRecording] = useState<boolean>(false);

  // 2. 화면엔 안 보이지만 기억해야할 도구들
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {

      // 1. 마이크 권한 요청 및 스트림 얻기
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // 1-1. 오디오 mime 타입 확인 및 설정
      let options = {};
      if (MediaRecorder.isTypeSupported('audio/webm')) {
        options = { mimeType: 'audio/webm' };
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        options = { mimeType: 'audio/mp4' };
      }

      // 2. 녹음 기계 생성 (스트림 연결)
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;  // Ref에 창고에 기계 보관 
      audioChunksRef.current = []; // 녹음 테이프 배열 초기화

      // 3. 데이터 수집 (테이프 감기)
      mediaRecorder.ondataavailable = (e: BlobEvent) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      // 4. 녹음 종료 시 처리 (테이프 완성)
      mediaRecorder.onstop = () => {
        // 바구니에 담긴 조각들을 본드로 붙려서 하나의 파일 blob 으로 만들기
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        // Voiceorder.tsx 로 파일 배달
        if (onStopCallback) onStopCallback(audioBlob);
        
        // 스트림 트랙 종료 (마이크 아이콘 끄기)
        stream.getTracks().forEach(track => track.stop());
      };

      // 5. 녹음 시작
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error(err);
      alert("마이크 권한이 필요합니다.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  // 이 훅을 사용하는 컴포넌트(App.tsx)에게 이 3가지 기능만 선물 세트로 묶어서 줍니다.
  return { isRecording, startRecording, stopRecording };
};