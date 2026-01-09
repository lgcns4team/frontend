// src/components/CustomCursor.tsx
import { useEffect, useState } from 'react';

const CustomCursor = () => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isClicking, setIsClicking] = useState(false);
    const [isVisible, setIsVisible] = useState(true); // 커서 가시성 상태 추가
    const [clicks, setClicks] = useState<{ id: number; x: number; y: number }[]>([]);

    useEffect(() => {
        const moveCursor = (e: MouseEvent) => {
            setPosition({ x: e.clientX, y: e.clientY });
            if (!isVisible) setIsVisible(true);
        };

        const handleMouseDown = (e: MouseEvent) => {
            if (e.button !== 0) return; 
            setIsClicking(true);
            const newClick = { id: Date.now(), x: e.clientX, y: e.clientY };
            setClicks((prev) => [...prev, newClick]);
            setTimeout(() => {
                setClicks((prev) => prev.filter((c) => c.id !== newClick.id));
            }, 400);
        };

        const handleMouseUp = () => setIsClicking(false);

        // 마우스가 브라우저 밖으로 나갈 때 처리
        const handleMouseLeave = () => setIsVisible(false);
        const handleMouseEnter = () => {
            setIsVisible(true);
            // 진입 시점에 강제로 body 커서를 none으로 다시 세팅
            document.body.style.cursor = 'none';
        };

        window.addEventListener('mousemove', moveCursor);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
        document.documentElement.addEventListener('mouseleave', handleMouseLeave);
        document.documentElement.addEventListener('mouseenter', handleMouseEnter);

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
            document.documentElement.removeEventListener('mouseenter', handleMouseEnter);
        };
    }, [isVisible]);

    if (!isVisible) return null; // 창 밖에 있을 때는 커서 컴포넌트 안 그림

    return (
        <>
            <div
                className={`custom-cursor ${isClicking ? 'clicking' : ''}`}
                style={{ 
                    left: `${position.x}px`, 
                    top: `${position.y}px`,
                    display: isVisible ? 'block' : 'none' 
                }}
            />
            {clicks.map((click) => (
                <div
                    key={click.id}
                    className="click-effect"
                    style={{ left: `${click.x}px`, top: `${click.y}px` }}
                />
            ))}
        </>
    );
};

export default CustomCursor;