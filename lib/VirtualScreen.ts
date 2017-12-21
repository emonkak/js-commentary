import { Chat, ChatSize, FontFamily, FontResolver, Dimension, RenderScreen, StagingSlot, TextMeasurer } from './types';
import { definedAsFixed, getCharacterSize, getLineHeight, getMotionForFixed, getMotionForMoving, getStagingY, getXForMoving } from './algorithm';

const DEFAULT_SLOT_LIMIT = 40;

const MAXIMUM_LINE_COUNTS: Record<ChatSize, number> = {
    big: 3,
    medium: 5,
    small: 7
};

export default class VirtualScreen {
    constructor(private _textMeasurer: TextMeasurer,
                private _fontResolver: FontResolver,
                private _slotLimit: number = DEFAULT_SLOT_LIMIT
    ) {
    }

    render(prevStagingSlots: StagingSlot[], nextStagingChats: Chat[], renderScreen: RenderScreen, contentTime: number): StagingSlot[] {
        const nextStagingSlots: StagingSlot[] = [];

        for (const slot of prevStagingSlots) {
            if (slot.chat.removedAt > contentTime) {
                if (definedAsFixed(slot.chat.position)) {
                    nextStagingSlots.push(slot);
                } else {
                    const updatedSlot = {
                        chat: slot.chat,
                        fontFamily: slot.fontFamily,
                        dimension: slot.dimension,
                        motion: slot.motion,
                        x: getXForMoving(slot.chat, slot.motion, contentTime),
                        y: slot.y
                    };
                    nextStagingSlots.push(updatedSlot);
                }
            }
        }

        for (const chat of nextStagingChats) {
            const slot = this._makeStagingSlot(chat, nextStagingSlots, renderScreen, contentTime);

            nextStagingSlots.push(slot);

            if (nextStagingSlots.length >= this._slotLimit) {
                nextStagingSlots.shift();
            }
        }

        return nextStagingSlots;
    }

    private _makeStagingSlot(chat: Chat, stagingSlots: StagingSlot[], renderScreen: RenderScreen, contentTime: number): StagingSlot {
        const isFixed = definedAsFixed(chat.position);
        const characterSize = getCharacterSize(chat.size, renderScreen);
        const lineHeight = getLineHeight(chat.size, renderScreen);
        const fontFamily = this._fontResolver.resolve(chat.font);

        const dimension = this._measure(
            chat,
            fontFamily,
            characterSize,
            lineHeight,
            renderScreen
        );
        const motion = isFixed ?
            getMotionForFixed(dimension.width, renderScreen) :
            getMotionForMoving(dimension.width, renderScreen)

        const x = getXForMoving(chat, motion, contentTime);
        const y = getStagingY(chat, motion, dimension, stagingSlots, renderScreen)

        return {
            chat,
            dimension,
            motion,
            fontFamily,
            x,
            y
        };
    }

    private _measure(chat: Chat, fontFamily: FontFamily, characterSize: number, lineHeight: number, renderScreen: RenderScreen): Dimension {
        let dimension = this._textMeasurer.measure(
            chat.content,
            fontFamily,
            characterSize,
            lineHeight
        );

        const baseScreenWidth = existCommand(chat, 'full') ? renderScreen.width : renderScreen.baseWidth;
        const shouldNewLineResizing = dimension.lineCount >= MAXIMUM_LINE_COUNTS[chat.size];
        const isFixed = definedAsFixed(chat.position);
        const isEnder = existCommand(chat, 'ender');
        const isOverflow = isFixed && dimension.width > baseScreenWidth;

        if ((isOverflow || shouldNewLineResizing) && !isEnder) {
            if (shouldNewLineResizing) {
                const resizedLineHeight = getLineHeight(chat.size, renderScreen, true);
                dimension = this._textMeasurer.measure(
                    chat.content,
                    fontFamily,
                    dimension.characterSize * (resizedLineHeight / dimension.lineHeight),
                    resizedLineHeight
                );
            }

            if (isFixed && dimension.width > baseScreenWidth) {
                const originalCharacterSize = dimension.characterSize;
                const resizeRatio = baseScreenWidth / dimension.width;

                dimension = this._textMeasurer.measure(
                    chat.content,
                    fontFamily,
                    dimension.characterSize * resizeRatio,
                    dimension.lineHeight * resizeRatio
                );

                if (dimension.width > baseScreenWidth) {
                    do {
                        const trialCharacterSize = dimension.characterSize - 1;
                        dimension = this._textMeasurer.measure(
                            chat.content,
                            fontFamily,
                            trialCharacterSize,
                            dimension.lineHeight * (trialCharacterSize / dimension.characterSize)
                        );
                    } while (dimension.width > baseScreenWidth);
                } else if (dimension.width < baseScreenWidth) {
                    let nextDimension = dimension;
                    do {
                        dimension = nextDimension;
                        const trialCharacterSize = dimension.characterSize + 1;
                        nextDimension = this._textMeasurer.measure(
                            chat.content,
                            fontFamily,
                            trialCharacterSize,
                            dimension.lineHeight * (trialCharacterSize / dimension.characterSize)
                        );
                    } while (nextDimension.width < baseScreenWidth);
                }

                if (shouldNewLineResizing) {
                    const resizeRatio = dimension.characterSize / originalCharacterSize;
                    dimension = {
                        width: dimension.width,
                        height: dimension.height,
                        characterSize: dimension.characterSize * resizeRatio,
                        lineHeight: dimension.lineHeight * resizeRatio,
                        lineCount: dimension.lineCount,
                        actualCharacterSize: dimension.actualCharacterSize,
                        adjusterScale: dimension.adjusterScale
                    };
                }
            }
        }

        return dimension;
    }
}

function existCommand(chat: Chat, command: string): boolean {
    return chat.commands.indexOf(command) >= 0;
}
