import { Chat, ChatPosition, ChatSize, Dimension, Motion, RenderScreen, StagingSlot } from './types';

const SUPPORTED_MINIMUM_CHARACTER_SIZE = 10;

const CHARACTER_SIZE_RATIOS: Record<ChatSize, number> = {
    big: 7.8,
    medium: 11.3,
    small: 16.6
};
const LINE_HEIGHT_RATIOS: Record<ChatSize, number> = {
    big: 8.4,
    medium: 13.1,
    small: 21
};
const LINE_HEIGHT_RATIOS_FOR_NEW_LINE_RESIZING: Record<ChatSize, number> = {
    big: 16,
    medium: 25.4,
    small: 38
};

export function getAdjusterCharacterSize(characterSize: number): { actualCharacterSize: number, adjusterScale: number } {
    const adjustedCharacterSize = characterSize * 0.8;
    if (adjustedCharacterSize < SUPPORTED_MINIMUM_CHARACTER_SIZE) {
        const adjusterScale = (adjustedCharacterSize >= 1 ? Math.floor(adjustedCharacterSize) : adjustedCharacterSize) /
                              SUPPORTED_MINIMUM_CHARACTER_SIZE;
        return {
            actualCharacterSize: SUPPORTED_MINIMUM_CHARACTER_SIZE,
            adjusterScale
        };
    } else {
        return {
            actualCharacterSize: Math.floor(adjustedCharacterSize),
            adjusterScale: 1
        };
    }
}

export function getCharacterSize(size: ChatSize, renderScreen: RenderScreen): number {
    return renderScreen.baseHeight / CHARACTER_SIZE_RATIOS[size]!;
}

export function getLineHeight(size: ChatSize, renderScreen: RenderScreen, shouldNewlineResizing: boolean = false): number {
    const characterSize = getCharacterSize(size, renderScreen);
    const ratio = LINE_HEIGHT_RATIOS[size];
    if (shouldNewlineResizing) {
        const newLineResizingRatio = LINE_HEIGHT_RATIOS_FOR_NEW_LINE_RESIZING[size];
        return (renderScreen.baseHeight - characterSize * (ratio / newLineResizingRatio)) / (newLineResizingRatio - 1);
    }
    return (renderScreen.baseHeight - characterSize) / (ratio - 1);
}

export function getXForMoving(chat: Chat, motion: Motion, contentTime: number): number {
    return motion.initialX + (motion.targetX - motion.initialX) * ((contentTime - chat.stagedAt) / (chat.removedAt - chat.stagedAt));
}

export function getStagingY(chat: Chat, motion: Motion, dimension: Dimension, stagingSlots: StagingSlot[], renderScreen: RenderScreen): number {
    if (dimension.height >= renderScreen.height) {
        switch (chat.position) {
            case 'shita':
                return 0 + renderScreen.height - dimension.height;
            case 'ue':
                return 0;
            default:
                return (dimension.height - renderScreen.height) / 2;
        }
    }

    let y: number;
    let topToBottom: boolean;

    if (chat.position === 'shita') {
        y = renderScreen.height - dimension.height;
        topToBottom = false;
    } else {
        y = 0;
        topToBottom = true;
    }

    let retry: boolean;
    do {
        retry = false;
        for (const slot of stagingSlots) {
            if (!(definedAsFixed(chat.position) && slot.chat.removedAt - chat.stagedAt <= 200) &&
                !(slot.y + slot.dimension.height < y || y + dimension.height < slot.y) &&
                (motion.initialX <= getXForMoving(slot.chat, slot.motion, chat.stagedAt) + slot.dimension.width ||
                 getXForMoving(chat, motion, slot.chat.removedAt) <= slot.motion.targetX + slot.dimension.width)) {
                if (topToBottom) {
                    y = slot.y + slot.dimension.height + 0.1;
                    if (y + dimension.height >= renderScreen.height) {
                        return getRandomY(chat, dimension.height, renderScreen);
                    }
                } else {
                    y = slot.y - dimension.height - 0.1;
                    if (y <= 0) {
                        return getRandomY(chat, dimension.height, renderScreen);
                    }
                }
                retry = true;
                break;
            }
        }
    } while (retry);

    return y;
}

function getRandomY(chat: Chat, height: number, renderScreen: RenderScreen): number {
    const chatString =
        '' +
        chat.id +
        chat.stagedAt +
        chat.removedAt +
        chat.position +
        chat.size +
        chat.color +
        chat.font +
        chat.commands.join('') +
        chat.content;
    return (hashCode(chatString) / 0xffffffff) * (renderScreen.height - height);
}

export function getMotionForMoving(width: number, renderScreen: RenderScreen): Motion {
    return {
        initialX: renderScreen.width,
        targetX: -width
    };
}

export function getMotionForFixed(width: number, renderScreen: RenderScreen): Motion {
    const x = renderScreen.width / 2 - width / 2;
    return {
        initialX: x,
        targetX: x
    };
}

export function definedAsFixed(position: ChatPosition): boolean {
    return position === 'ue' || position === 'shita';
}

function hashCode(input: string): number {
    let hash = 0;

    for (let i = 0, l = input.length; i < l; i++) {
        const char = input.charCodeAt(i);
        hash = (((hash << 5) - hash) + char) >>> 0;  // cast to 32bit unsigined int
    }

    return hash;
}
