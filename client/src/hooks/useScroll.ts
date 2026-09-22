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

    useEffect(() => {
        const container = scrollContainerRef.current;
        const target = cardRefs.current[selectedIndex];
        if (!container || !target) return;

        const rowTops = Array.from(
            new Set(
                cardRefs.current
                    .filter((el): el is HTMLDivElement => !!el)
                    .map((el) => el.offsetTop)
            )
        ).sort((a, b) => a - b);

        const currentRow = rowTops.indexOf(target.offsetTop);
        if (currentRow === -1) return;

        const targetScrollTop = currentRow < 2 ? 0 : rowTops[currentRow - 1];

        animateScrollTo(container, targetScrollTop, 200);
    }, [selectedIndex, itemsLength]);

    return { scrollContainerRef, setCardRef };
};