import { useEffect } from 'react';

/**
 * Custom hook to enable mouse and touch drag-to-scroll on an overflow container ref
 */
export const useDragScroll = (scrollRef) => {
    useEffect(() => {
        const slider = scrollRef?.current;
        if (!slider) return;

        let isDown = false;
        let startY;
        let scrollTop;

        const handleMouseDown = (e) => {
            isDown = true;
            startY = e.pageY - slider.offsetTop;
            scrollTop = slider.scrollTop;
        };

        const handleMouseLeave = () => (isDown = false);
        const handleMouseUp = () => (isDown = false);

        const handleMouseMove = (e) => {
            if (!isDown) return;
            e.preventDefault();
            const y = e.pageY - slider.offsetTop;
            const walk = (y - startY) * 1;
            slider.scrollTop = scrollTop - walk;
        };

        const handleTouchStart = (e) => {
            isDown = true;
            startY = e.touches[0].pageY - slider.offsetTop;
            scrollTop = slider.scrollTop;
        };

        const handleTouchMove = (e) => {
            if (!isDown) return;
            const y = e.touches[0].pageY - slider.offsetTop;
            const walk = (y - startY) * 1;
            slider.scrollTop = scrollTop - walk;
        };

        const handleTouchEnd = () => (isDown = false);

        slider.addEventListener('mousedown', handleMouseDown);
        slider.addEventListener('mouseleave', handleMouseLeave);
        slider.addEventListener('mouseup', handleMouseUp);
        slider.addEventListener('mousemove', handleMouseMove);
        slider.addEventListener('touchstart', handleTouchStart);
        slider.addEventListener('touchmove', handleTouchMove);
        slider.addEventListener('touchend', handleTouchEnd);

        return () => {
            slider.removeEventListener('mousedown', handleMouseDown);
            slider.removeEventListener('mouseleave', handleMouseLeave);
            slider.removeEventListener('mouseup', handleMouseUp);
            slider.removeEventListener('mousemove', handleMouseMove);
            slider.removeEventListener('touchstart', handleTouchStart);
            slider.removeEventListener('touchmove', handleTouchMove);
            slider.removeEventListener('touchend', handleTouchEnd);
        };
    }, [scrollRef]);
};

export default useDragScroll;
