export function append<T>(sortedArray: T[], element: T, comparer: (x: T, y: T) => number): T[] {
    const size = sortedArray.length;
    const items = new Array(size + 1);
    const insertPosition = findInsertPosition(sortedArray, element, 0, size - 1, comparer);

    for (let i = 0; i < insertPosition; i++) {
        items[i] = sortedArray[i];
    }

    items[insertPosition] = element;

    for (let i = insertPosition; i < size; i++) {
        items[i + 1] = sortedArray[i];
    }

    return items;
}

export function merge<T>(sortedArray: T[], elements: T[], comparer: (x: T, y: T) => number): T[] {
    const addedElements = elements.slice().sort(comparer);

    if (sortedArray.length < addedElements.length) {
        return mergeSortedArray(addedElements, sortedArray, comparer);
    } else {
        return mergeSortedArray(sortedArray, addedElements, comparer);
    }
}

export function indexOf<T>(sortedArray: T[], element: T, comparer: (x: T, y: T) => number): number {
    return binarySearch(sortedArray, element, 0, sortedArray.length - 1, comparer);
}

function binarySearch<T>(haystack: T[], needle: T, minIndex: number, maxIndex: number, comparer: (x: T, y: T) => number): number {
    while (minIndex <= maxIndex) {
        const index = (minIndex + maxIndex) >> 1;
        const element = haystack[index];
        const ordering = comparer(element, needle);

        if (ordering > 0) {
            maxIndex = index - 1;
        } else if (ordering < 0) {
            minIndex = index + 1;
        } else {
            return index;
        }
    }

    return -1;
}

function findInsertPosition<T>(haystack: T[], needle: T, minIndex: number, maxIndex: number, comparer: (x: T, y: T) => number): number {
    while (minIndex <= maxIndex) {
        const index = (minIndex + maxIndex) >> 1;
        const element = haystack[index];
        const ordering = comparer(element, needle);

        if (ordering > 0) {
            maxIndex = index - 1;
        } else if (ordering < 0) {
            minIndex = index + 1;
        } else {
            return index;
        }
    }

    return ((minIndex + maxIndex) >> 1) + 1;
}

function mergeSortedArray<T>(outerElements: T[], innerElements: T[], comparer: (x: T, y: T) => number): T[] {
    const outerSize = outerElements.length;
    const innerSize = innerElements.length;
    const items = new Array(innerSize + outerSize);

    let outerCursor = 0;

    for (let i = 0; i < innerSize; i++) {
        const innerElement = innerElements[i];
        const insertPosition = findInsertPosition(outerElements, innerElement, outerCursor, outerSize - 1, comparer);

        for (let j = outerCursor; j < insertPosition; j++) {
            items[i + j] = outerElements[j];
        }

        items[i + insertPosition] = innerElement;

        outerCursor = insertPosition;
    }

    for (let i = outerCursor; i < outerSize; i++) {
        items[i + innerSize] = outerElements[i];
    }

    return items;
}
