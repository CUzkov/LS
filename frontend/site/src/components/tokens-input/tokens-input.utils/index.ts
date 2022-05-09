import { Token as MooToken } from 'moo';

export enum Tokens {
    openBracket = '(',
    closeBracket = ')',
    and = 'AND',
    or = 'OR',
}

const operandTokens: string[] = [Tokens.or, Tokens.and, Tokens.or.toLowerCase(), Tokens.and.toLowerCase()];

export const formatErrorText = (error: string, errorDecs: string): string => {
    const splitError = error.split(' ').filter(Boolean);
    let result = '';

    while (result.length < 15 && splitError.length > 0) {
        const nextToken = splitError.shift();
        nextToken ? (result += ` ${nextToken}`) : undefined;
    }

    if (result.length > 15) {
        result = result.slice(0, 15) + '...';
    }

    result += `\n\nошибка синтаксиса: ${errorDecs}`;

    return result;
};

export const checkInfixErrors = (
    tokens: MooToken[],
): { position: number; error: string; tokenIndex: number } | void => {
    // текущее количество открытых скобок
    let currentOpenBracketCount = 0;
    // текущая позиция в исходной стороке (до разбивки на токены)
    let currentPosition = 0;
    // позиция последней встреченной открывающей скобки в исходной стороке (до разбивки на токены)
    let lastOpenBracketPosition = 0;
    // индекс последней встреченной открывающей скобки в массиве tokens
    let lastOpenBracketIndex = 0;
    // последний обработанный токен (не считая пробелов)
    let lastProcessedToken = '';
    // индекс последнего обработанного токена в массиве tokens
    let lastProcessedTokenIndex = 0;
    // позиция последнего обработанного токена в исходной стороке (до разбивки на токены)
    let lastProcessedTokenPosition = 0;

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const isOpenBracket = token.text === Tokens.openBracket;
        const isCloseBracket = token.text === Tokens.closeBracket;

        if (isOpenBracket) {
            currentOpenBracketCount++;
            lastOpenBracketPosition = currentPosition;
            lastOpenBracketIndex = i;
        }

        if (isCloseBracket) {
            if (lastProcessedToken === Tokens.openBracket) {
                return { position: currentPosition, error: 'пустые скобки недопустимы', tokenIndex: i };
            }

            if (currentOpenBracketCount === 0) {
                return {
                    position: currentPosition,
                    error: 'закрывающая скобка должна иметь открывающую',
                    tokenIndex: i,
                };
            } else {
                currentOpenBracketCount--;
            }

            if (operandTokens.includes(lastProcessedToken)) {
                return { position: currentPosition, error: 'после оператора должен стоять операнд', tokenIndex: i };
            }
        }

        const isOperator = operandTokens.includes(token.text);

        if (isOperator) {
            if (operandTokens.includes(lastProcessedToken)) {
                return { position: currentPosition, tokenIndex: i, error: 'два подряд оператора не допустимы' };
            }

            if (lastProcessedToken === '' || lastProcessedToken === Tokens.openBracket) {
                return { position: currentPosition, tokenIndex: i, error: 'перед оператором должен стоять операнд' };
            }
        }

        lastProcessedToken = token.text === ' ' ? lastProcessedToken : token.text;
        lastProcessedTokenIndex = token.text === ' ' ? lastProcessedTokenIndex : i;
        lastProcessedTokenPosition = token.text === ' ' ? lastProcessedTokenPosition : currentPosition;

        currentPosition += token.text.length;
    }

    if (operandTokens.includes(lastProcessedToken)) {
        return {
            position: lastProcessedTokenPosition,
            tokenIndex: lastProcessedTokenIndex,
            error: 'выражение не может оканчиваться оператором',
        };
    }

    if (currentOpenBracketCount !== 0) {
        return {
            position: lastOpenBracketPosition,
            error: 'открывающая скобка должна иметь закрывающую',
            tokenIndex: lastOpenBracketIndex,
        };
    }
};
