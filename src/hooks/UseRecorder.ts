import { useState, useRef, useCallback } from "react";

interface UseRecorderReturn {
  isRecording: boolean;
  audioUrl: string | null;
  audioFile: File | null;
  audioLevel: number; // 0.0 ~ 1.0 (비주얼라이저용)
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  resetRecording: () => void;
}

export const useRecorder = (): UseRecorderReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // 비주얼라이저용 Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const rafIdRef = useRef<number | null>(null);

  // 오디오 레벨 분석 루프
  const analyzeAudioLevel = useCallback(() => {
    if (!analyserRef.current || !dataArrayRef.current) return;

    analyserRef.current.getByteFrequencyData(dataArrayRef.current);

    let sum = 0;
    for (let i = 0; i < dataArrayRef.current.length; i++) {
      sum += dataArrayRef.current[i];
    }
    const average = sum / dataArrayRef.current.length;

    // 감도 조절 (평균값을 0~1 사이로 정규화)
    const normalizedLevel = Math.min(1, average / 50); 
    setAudioLevel(normalizedLevel);
    
    rafIdRef.current = requestAnimationFrame(analyzeAudioLevel);
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {

          echoCancellation: true, // 스피커 소리가 다시 마이크로 들어가는 것 방지
          noiseSuppression: true, // 배경 잡음 제거 (브라우저 내장 기능)
          autoGainControl: true,
        }
      });
      
      // 1. MediaRecorder 설정
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        const file = new File([audioBlob], "recording.webm", {
          type: "audio/webm",
          lastModified: Date.now(),
        });
        setAudioFile(file);
        
        // 스트림 트랙 정지
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      
      // 2. Web Audio API 설정 (비주얼라이저)
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      audioContextRef.current = new AudioContextClass();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      analyzeAudioLevel(); // 분석 시작
      
      setIsRecording(true);
      setAudioLevel(0);

    } catch (err) {
      console.error("마이크 오류:", err);
      alert("마이크 사용 권한을 허용해주세요.");
    }
  }, [analyzeAudioLevel]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    
    // 분석 중단
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    if (audioContextRef.current) audioContextRef.current.close();
    
    setIsRecording(false);
    setAudioLevel(0);
  }, [isRecording]);

  const resetRecording = useCallback(() => {
    setAudioUrl(null);
    setAudioFile(null);
    setAudioLevel(0);
  }, []);

  return {
    isRecording,
    audioUrl,
    audioFile,
    audioLevel,
    startRecording,
    stopRecording,
    resetRecording,
  };
};