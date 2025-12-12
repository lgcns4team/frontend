
// 옵션 예쁘게 정리하는 함수 
export const formatOptions = (options?: string[]): string | null => {
  // 방어 처리: 옵션이 없거나 빈 배열인 경우 null 반환
  if (!options || options.length === 0) return null;
  
  // 갯수를 셀 노트를 하나 만드는 과정 <메뉴명, 숫자(갯수)> {} 처음엔 비어있다는 뜻
  const counts: Record<string, number> = {};
  // 핵심 카운팅 로직 forEach는 배열을 하나씩 훑는다 
  options.forEach((opt) => {
    counts[opt] = (counts[opt] || 0) + 1;
  });
  
  // 노트에 적힌걸 문자열로 바꿔주는 과정 
  return Object.entries(counts)
    .map(([name, count]) => count > 1 ? `${name} x${count}` : name)
    .join(', ');
};


// 리액트 고유 키 생성 함수 시간을 밀리초단위로 가져온후 36진수로 바꿈 + 랜덤 문자열 생성 => 겹치지않는 고유한 ID 를 발급한다 
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};