import { useEffect, useRef } from 'react';

const easeOutQuad = (t: number) => t * (2 - t);

const animateScrollTo = (
    container: HTMLDivElement,
    targetTop: number,
    duration: number = 200
) => {
    const startTop = container.scrollTop;
    const distance = targetTop - startTop;
    const startTime = performance.now();

    const step = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutQuad(progress);

        container.scrollTop = startTop + distance * eased;

        if (progress < 1) {
            requestAnimationFrame(step);
        }
    };

    requestAnimationFrame(step);
};

export const useScroll = (selectedIndex: number, itemsLength: number) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

    const setCardRef = (index: number) => (el: HTMLDivElement | null) => {
        cardRefs.current[index] = el;
    };

    const getColumnsCount = () => {
        const refs = cardRefs.current;
        if (!refs[0]) return 1;
        const firstTop = refs[0]!.offsetTop;
        let count = 0;
        for (const el of refs) {
            if (!el || el.offsetTop !== firstTop) break;
            count++;
        }
        return count || 1;
    };

    const getRowHeight = (columns: number) => {
        const refs = cardRefs.current;
        if (!refs[0] || !refs[columns]) return 0;
        return refs[columns]!.offsetTop - refs[0]!.offsetTop;
    };

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container || cardRefs.current.length === 0) return;

        const columns = getColumnsCount();
        const row = Math.floor(selectedIndex / columns);
        const rowHeight = getRowHeight(columns);

        if (!rowHeight) return;

        const targetScrollTop = row < 2 ? 0 : (row - 1) * rowHeight;

        animateScrollTo(container, targetScrollTop, 200);
    }, [selectedIndex, itemsLength]);

    return { scrollContainerRef, setCardRef };
};