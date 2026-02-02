export const calculatePerformanceMetrics = (monthlyCuts: number[], excludedFromAverage: boolean[]) => {
    const safeCuts = monthlyCuts || new Array(12).fill(0);
    const safeExcluded = excludedFromAverage || new Array(12).fill(false);

    // Calculate Average (excluding flagged months)
    let total = 0;
    let count = 0;
    safeCuts.forEach((val, idx) => {
        if (!safeExcluded[idx]) {
            total += val;
            count++;
        }
    });
    const average = count > 0 ? Math.round(total / count) : 0;

    // Calculate Predicted Total
    let predictedTotal = 0;
    let emptyCount = 0;

    safeCuts.forEach((val, idx) => {
        if (val > 0) {
            predictedTotal += val;
        } else {
            // Use average for future/empty months
            predictedTotal += average;
            emptyCount++;
        }
    });

    // Current Raw Total
    const currentTotal = safeCuts.reduce((a, b) => a + b, 0);

    return { currentTotal, average, predictedTotal, emptyCount };
};

export const generateUUID = () => {
    // Simple fallback to avoid any crypto/secure context issues
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};
