import { useState, useEffect, useRef } from 'react';
import { useRecorder } from './UseRecorder';
import { sendAudioOrder } from '../api/VoiceOrderApi';
import { fetchMenuOptions } from '../api/MenuApi';
import { useCartStore } from '../store/UseCartStore';
import type { MenuItem, Options } from '../types/OrderTypes';
import type { OrderAction } from '../types/VoiceOrderTypes'; 

const TAG_GROUPS: Record<string, string> = {
  // 기존 설정
  hot: 'temp', cold: 'temp',
  tall: 'size', grande: 'size', venti: 'size',
  less_ice: 'ice', normal_ice: 'ice', more_ice: 'ice',
  
  // 👇 [추가] 샷과 휘핑 관련 그룹 정의 추가
  shot: 'shot', 
  shot_none: 'shot', // 'shot_none'이 들어오면 기존 'shot'을 덮어써서 지움
  
  whip: 'whip', 
  whip_none: 'whip'  // 휘핑 빼기도 동일한 원리로 동작
};

interface UseVoiceOrderProcessorProps {
  items: MenuItem[];
}

export const useVoiceOrderProcessor = ({ items }: UseVoiceOrderProcessorProps) => {
  const [logText, setLogText] = useState<string>('파란색 버튼을 누르고\n말씀해주세요');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  const { addToCart, removeFromCart } = useCartStore();
  const { isRecording, audioFile, audioLevel, startRecording, stopRecording, resetRecording } = useRecorder();

  const lastHeardTimeRef = useRef<number>(0);
  const silenceCheckIntervalRef = useRef<number | null>(null);

  const speak = (message: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = 'ko-KR';
      utterance.rate = 1.2;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const mergeVoiceTags = (oldTags: string[], newTags: string[]) => {
    const filteredOld = oldTags.filter((oldTag) => {
      const oldGroup = TAG_GROUPS[oldTag];
      if (oldGroup && newTags.some((newTag) => TAG_GROUPS[newTag] === oldGroup)) {
        return false;
      }
      return true;
    });
    return [...filteredOld, ...newTags];
  };

  const resolveBackendOptions = async (menuId: number, voiceTags: string[]) => {
    try {
      // 1. [핵심 수정] 전체 옵션 그룹(메뉴판)을 가져와서 변수에 저장
      const optionGroups = await fetchMenuOptions(menuId);
      
      const resolvedOptions: { optionItemId: number; quantity: number; price: number; name: string }[] = [];
      const globalOptions: Partial<Options> = {};

      const findOption = (keywords: string[]) => {
        for (const group of optionGroups) {
          for (const opt of group.options) {
            if (keywords.some((k) => opt.name.toLowerCase().includes(k))) return opt;
          }
        }
        return null;
      };

      if (voiceTags.includes('hot')) {
        const opt = findOption(['hot', '따뜻']);
        if (opt) { resolvedOptions.push({ ...opt, quantity: 1, price: opt.optionPrice }); globalOptions.temperature = 'hot'; }
      } else if (voiceTags.includes('cold')) {
        const opt = findOption(['ice', '아이스', '차가운']);
        if (opt) { resolvedOptions.push({ ...opt, quantity: 1, price: opt.optionPrice }); globalOptions.temperature = 'cold'; }
      }
      if (voiceTags.includes('tall')) {
        const opt = findOption(['tall', '톨']);
        if (opt) { resolvedOptions.push({ ...opt, quantity: 1, price: opt.optionPrice }); globalOptions.size = 'tall'; }
      } else if (voiceTags.includes('grande')) {
        const opt = findOption(['grande', '그란데']);
        if (opt) { resolvedOptions.push({ ...opt, quantity: 1, price: opt.optionPrice }); globalOptions.size = 'grande'; }
      } else if (voiceTags.includes('venti')) {
        const opt = findOption(['venti', '벤티']);
        if (opt) { resolvedOptions.push({ ...opt, quantity: 1, price: opt.optionPrice }); globalOptions.size = 'venti'; }
      }
      const shotCount = voiceTags.filter((t) => t === 'shot').length;
      if (shotCount > 0) {
        const opt = findOption(['shot', '샷']);
        if (opt) { resolvedOptions.push({ ...opt, quantity: shotCount, price: opt.optionPrice }); globalOptions.shot = shotCount; }
      }
      if (voiceTags.includes('whip')) {
        const opt = findOption(['휘핑 크림 추가', '휘핑']);
        if (opt) { resolvedOptions.push({ ...opt, quantity: 1, price: opt.optionPrice }); globalOptions.whip = true; }
      }
      if (voiceTags.includes('less_ice')) {
        const opt = findOption(['적게']);
        if (opt) { resolvedOptions.push({ ...opt, quantity: 1, price: opt.optionPrice }); globalOptions.ice = 'less'; }
      } else if (voiceTags.includes('more_ice')) {
        const opt = findOption(['많이']);
        if (opt) { resolvedOptions.push({ ...opt, quantity: 1, price: opt.optionPrice }); globalOptions.ice = 'more'; }
      }

      // 2. [핵심 수정] 선택된 옵션뿐만 아니라 '전체 옵션 그룹(fullOptionGroups)'도 반환
      return { 
        fullOptionGroups: optionGroups, // 여기가 수정됨: 전체 목록 반환
        backendOptions: resolvedOptions, 
        globalOptions 
      };

    } catch (e) {
      console.error(e);
      // 에러 발생 시에도 빈 배열로 구조 맞춰서 반환
      return { fullOptionGroups: [], backendOptions: [], globalOptions: {} };
    }
  };

  const handleVoiceActions = async (actions: OrderAction[]) => {
    for (const action of actions) {
      /////////////////////////////추가///////////////
      if (action.type === 'ADD') {
        const targetItem = items.find((i) => i.name === action.data.name);
        if (targetItem) {
          const newTags = action.data.option_ids || [];
          
          // [핵심 수정] fullOptionGroups를 받아옵니다.
          const { fullOptionGroups, backendOptions, globalOptions } = await resolveBackendOptions(targetItem.id, newTags);
          
          addToCart(
            targetItem,
            { ...globalOptions, voiceOptionIds: newTags } as any,
            action.data.quantity || 1,
            backendOptions,
            // [핵심 수정] backendOptions(선택된것) 대신 fullOptionGroups(전체목록)를 넘깁니다.
            // 타입 에러 방지를 위해 as any 사용 (UseCartStore 타입에 맞게 조정)
            fullOptionGroups as any 
          );
        }
      } 


      ////////////////////////////업데이트///////////////
      
      else if (action.type === 'UPDATE') {
        const currentCart = useCartStore.getState().cart;
        let targetIndex = -1;

        // 1. [수정] 검색 대상은 '새 이름(data.name)'이 아니라 '타겟 이름(targetId)'이어야 합니다.
        // targetId가 유효하면 그것을 쓰고, 아니면 'last_item'(마지막)으로 간주합니다.
        const searchName = (action.targetId && action.targetId !== 'last_item') ? action.targetId : null;

        if (searchName) {
          // 이름으로 장바구니 뒤에서부터 검색
          for (let i = currentCart.length - 1; i >= 0; i--) {
            if (currentCart[i].name.replace(/\s+/g, '') === searchName.replace(/\s+/g, '')) {
              targetIndex = i;
              break;
            }
          }
        } else {
          // 이름 정보가 없으면 맨 마지막 아이템 선택
          if (currentCart.length > 0) {
            targetIndex = currentCart.length - 1;
          }
        }

        // 대상을 찾았을 때만 실행
        if (targetIndex !== -1) {
          const targetCartItem = currentCart[targetIndex];
          
          // 2. [수정] 메뉴 자체가 바뀌는지 확인 (예: 카페라떼 -> 바닐라라떼)
          const isMenuChange = action.data.name && action.data.name !== targetCartItem.name;
          let itemToUpdate: MenuItem = targetCartItem; // 기본은 기존 아이템 유지
          let currentTags = (targetCartItem.options as any)?.voiceOptionIds || [];

          if (isMenuChange) {
             // 메뉴가 바뀌었다면, 전체 메뉴 목록(items)에서 새 메뉴를 찾습니다.
             const newItem = items.find(i => i.name === action.data.name);
             if (newItem) {
                itemToUpdate = newItem; // 업데이트 대상 교체!
                currentTags = []; // 메뉴가 바뀌었으니 기존 옵션(예: 샷추가)은 초기화하고 새로 받은 것만 적용
             }
          }

          // 3. 태그 병합
          const newTagsInput = action.data.option_ids || [];
          const mergedTags = mergeVoiceTags(currentTags, newTagsInput);
          
          // 4. 옵션 및 가격 정보 다시 계산 (바뀐 아이템 ID 기준)
          const { fullOptionGroups, backendOptions, globalOptions } = await resolveBackendOptions(itemToUpdate.id, mergedTags);

          // 5. 기존 아이템 삭제 후 업데이트된 아이템 추가
          removeFromCart(targetCartItem.cartId);
          
          addToCart(
            itemToUpdate, // [수정] 바뀐 메뉴 객체가 들어갑니다
            { ...globalOptions, voiceOptionIds: mergedTags } as any,
            action.data.quantity || targetCartItem.quantity, // 수량 변경 요청이 없으면 기존 수량 유지
            backendOptions, // 가격 계산용
            fullOptionGroups as any // 수정 모달용
          );
        } else {
          console.warn('수정할 대상을 찾지 못했습니다:', searchName || 'last_item');
          speak('수정할 메뉴를 찾지 못했어요.');
        }
      }
      
      else if (action.type === 'REMOVE') {
        const currentCart = useCartStore.getState().cart;
        let removeId = '';

        const searchName = action.id === 'last_item' ? null : action.id;

        if (searchName) {
           const target = [...currentCart].reverse().find(item => item.name === searchName);
           if (target) removeId = target.cartId;
        } else {
           if (currentCart.length > 0) removeId = currentCart[currentCart.length - 1].cartId;
        }

        if (removeId) removeFromCart(removeId);
      }
    }
  };

  useEffect(() => {
    const processAudio = async () => {
      if (audioFile && !isRecording) {
        setIsProcessing(true);
        setLogText('분석 중입니다...\n잠시만 기다려주세요');
        try {
          const response = await sendAudioOrder(audioFile);
          
          if (!response.text) {
            setLogText('잘 못 들었어요\n다시 말씀해 주세요');
            speak('잘 못 들었어요. 다시 말씀해 주세요');
          } else {
            setLogText(`"${response.text}"\n주문을 확인해주세요`);
            if (response.actions && response.actions.length > 0) {
              await handleVoiceActions(response.actions);
              speak('말씀하신 메뉴가 장바구니에 담겼어요');
            } else {
              speak('주문하실 메뉴를 말씀해 주세요');
            }
          }
        } catch (error) {
          console.error(error);
          setLogText('오류가 발생했습니다\n직원을 호출해주세요');
          speak('오류가 발생했습니다. 직원을 호출해주세요');
        } finally {
          setIsProcessing(false);
          resetRecording();
        }
      }
    };
    processAudio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioFile, isRecording]);

  useEffect(() => {
    if (isRecording && audioLevel > 0.05) lastHeardTimeRef.current = Date.now();
  }, [isRecording, audioLevel]);

  useEffect(() => {
    if (isRecording) {
      lastHeardTimeRef.current = Date.now();
      silenceCheckIntervalRef.current = window.setInterval(() => {
        if (Date.now() - lastHeardTimeRef.current > 5000) {
          stopRecording();
          setLogText('말씀이 없으셔서\n자동으로 종료되었어요');
          speak('말씀이 없으셔서 자동으로 종료되었어요');
          if (silenceCheckIntervalRef.current) clearInterval(silenceCheckIntervalRef.current);
        }
      }, 1000);
    } else {
      if (silenceCheckIntervalRef.current) clearInterval(silenceCheckIntervalRef.current);
    }
  }, [isRecording, stopRecording]);

  return {
    logText,
    setLogText,
    isProcessing,
    isRecording,
    audioLevel,
    speak,
    startRecording: () => {
        window.speechSynthesis.cancel();
        startRecording();
        setLogText('네, 듣고 있어요! 편하게 말씀해주세요');
    },
    stopRecording,
  };
};