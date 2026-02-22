import { useEffect, useState } from 'react';

export const useAdjacentCollapse = (ref: React.RefObject<HTMLElement>) => {
    const [adjustedColumns, setAdjustedColumns] = useState(0);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const row = element.closest('.row');
        if (!row) return;

        const calculateAdjustment = () => {
            const collapsedContainers = row.querySelectorAll('.vertical-collapse-container.collapsed').length;
            
            // If both containers are collapsed, we want to grow to 11 columns
            // Starting from 6, we need 5 additional columns
            if (collapsedContainers === 2) {
                return 5; // This will make a base-6 grow to 11
            }
            
            // If one container is collapsed, add 2.5 columns (rounded to 3)
            return collapsedContainers === 1 ? 3 : 0;
        };

        const observer = new MutationObserver(() => {
            setAdjustedColumns(calculateAdjustment());
        });

        observer.observe(row, {
            attributes: true,
            childList: true,
            subtree: true,
            attributeFilter: ['class']
        });

        // Initial calculation
        setAdjustedColumns(calculateAdjustment());

        return () => observer.disconnect();
    }, [ref]);

    return adjustedColumns;
};