import { useState, useEffect, useRef } from 'react';
import { useRecorder } from './UseRecorder';
import { sendAudioOrder } from '../api/VoiceOrderApi';
import { fetchMenuOptions } from '../api/MenuApi';
import { useCartStore } from '../store/UseCartStore';
import type { MenuItem, Options } from '../types/OrderTypes';

// ⭐️ [추가] VoiceOrderTypes에서 액션 타입 가져오기
import type { OrderAction } from '../types/VoiceOrderTypes'; 

const TAG_GROUPS: Record<string, string> = {
  hot: 'temp', cold: 'temp',
  tall: 'size', grande: 'size', venti: 'size',
  less_ice: 'ice', normal_ice: 'ice', more_ice: 'ice',
  whip: 'whip',
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

      return { backendOptions: resolvedOptions, globalOptions };
    } catch (e) {
      console.error(e);
      return { backendOptions: [], globalOptions: {} };
    }
  };

  // ⭐️ [수정] any[] 대신 OrderAction[] 타입을 명시!
  const handleVoiceActions = async (actions: OrderAction[]) => {
    for (const action of actions) {
      // [ADD 로직은 기존과 동일]
      if (action.type === 'ADD') {
        const targetItem = items.find((i) => i.name === action.data.name);
        if (targetItem) {
          const newTags = action.data.option_ids || [];
          const { backendOptions, globalOptions } = await resolveBackendOptions(targetItem.id, newTags);
          addToCart(
            targetItem,
            { ...globalOptions, voiceOptionIds: newTags } as any,
            action.data.quantity || 1,
            backendOptions
          );
        }
      } 
      
      // ⭐️ [UPDATE 로직 업그레이드] ⭐️
      else if (action.type === 'UPDATE') {
        const currentCart = useCartStore.getState().cart;
        let targetIndex = -1;

        // 1. 검색할 메뉴 이름 결정
        // action.data.name이 있으면(예: '아메리카노') 그걸로 찾고, 
        // 없으면 targetId를 사용, 그것도 'last_item'이면 이름 정보가 없는 것.
        const searchName = action.data.name || (action.targetId !== 'last_item' ? action.targetId : null);

        if (searchName) {
          // 2. 이름이 일치하는 아이템을 "뒤에서부터" 검색 (가장 최근에 담은 해당 메뉴)
          for (let i = currentCart.length - 1; i >= 0; i--) {
            if (currentCart[i].name === searchName) {
              targetIndex = i;
              break;
            }
          }
        } else {
          // 3. 이름 정보가 전혀 없으면 -> 그냥 맨 마지막 아이템 선택 (Fallback)
          if (currentCart.length > 0) {
            targetIndex = currentCart.length - 1;
          }
        }

        // 대상을 찾았을 때만 업데이트 실행
        if (targetIndex !== -1) {
          const targetCartItem = currentCart[targetIndex];
          
          // 기존 태그 + 새 태그 병합
          const oldTags = (targetCartItem.options as any)?.voiceOptionIds || [];
          const newTagsInput = action.data.option_ids || [];
          
          const mergedTags = mergeVoiceTags(oldTags, newTagsInput);
          const { backendOptions, globalOptions } = await resolveBackendOptions(targetCartItem.id, mergedTags);

          // 기존 아이템 삭제 후 업데이트된 정보로 재추가 (순서 유지를 위해 인덱스 고려 필요하지만, 보통 맨 뒤로 가도 무방)
          // *완벽한 제자리 수정을 원하면 store에 updateItem 기능이 있어야 하지만, 
          // 현재는 remove -> add 방식이므로 장바구니 맨 뒤로 이동하게 됩니다. 
          // (사용자 입장에선 "수정됨 = 최신 상태"이므로 크게 어색하지 않음)
          removeFromCart(targetCartItem.cartId);
          addToCart(
            targetCartItem,
            { ...globalOptions, voiceOptionIds: mergedTags } as any,
            targetCartItem.quantity, // 수량은 기존 유지 (또는 action.data.quantity 있으면 그걸로 변경 가능)
            backendOptions
          );
        } else {
          console.warn('수정할 대상을 찾지 못했습니다:', searchName || 'last_item');
        }
      } 
      
      // [REMOVE 로직도 이름 기반 검색으로 강화하면 좋습니다]
      else if (action.type === 'REMOVE') {
        const currentCart = useCartStore.getState().cart;
        let removeId = '';

        const searchName = action.id === 'last_item' ? null : action.id;

        if (searchName) {
           // 이름으로 뒤에서부터 검색
           const target = [...currentCart].reverse().find(item => item.name === searchName);
           if (target) removeId = target.cartId;
        } else {
           // 이름 없으면 맨 마지막
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
          
          // sendAudioOrder의 반환값도 이제 타입이 명확합니다.
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

  // (침묵 감지 등 나머지 로직 동일)
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