import React, { useCallback, useRef, useState, FC } from 'react';
import ReactDOM from 'react-dom';
import moo, { Token as MooToken } from 'moo';

import { getTextBoundingRect } from 'utils/getTextBoundingRect';
import { Button } from 'components/button';

import { Tokens, formatErrorText, checkInfixErrors } from './tokens-input.utils';

import styles from './style.scss';

const lexer = moo.compile({
    '(': Tokens.openBracket,
    ')': Tokens.closeBracket,
    AND: [Tokens.and, Tokens.and.toLowerCase()],
    OR: [Tokens.or, Tokens.or.toLowerCase()],
    ' ': ' ',
    username: /username="[a-zA-Zа-яА-Я0-9 ]+"/,
    error: moo.error,
});

export const TokensInput: FC = () => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [errorToken, setErrorToken] = useState<{ rect: DOMRect; token: MooToken; errorDesc: string } | undefined>();
    const [tokens, setTokens] = useState<string[]>([]);
    const isSearchButtonDisable = !!errorToken || !tokens.length;

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            lexer.reset(e.target.value);

            const tokens = Array.from(lexer);
            let newErrorToken: MooToken | undefined;

            for (let i = 0; i < tokens.length; i++) {
                if (tokens[i].type === 'error') {
                    newErrorToken = tokens[i];
                    break;
                }
            }

            if (inputRef.current && newErrorToken && newErrorToken?.offset !== -1) {
                //@FIXME внутри getTextBoundingRect каждый раз вызывается getBoundingRect. Нужно передавать
                // кешированный результат getBoundingRect в getTextBoundingRect
                const errorTokenRect = getTextBoundingRect(inputRef.current, newErrorToken?.offset);

                if (errorTokenRect) {
                    setErrorToken({ rect: errorTokenRect, token: newErrorToken, errorDesc: 'неизвестный токен' });
                }

                return;
            }

            const newErrorBrackets = checkInfixErrors(tokens);

            if (inputRef.current && newErrorBrackets) {
                const errorBracketsRect = getTextBoundingRect(inputRef.current, newErrorBrackets.position);

                if (errorBracketsRect) {
                    setErrorToken({
                        rect: errorBracketsRect,
                        token: tokens[newErrorBrackets.tokenIndex],
                        errorDesc: newErrorBrackets.error,
                    });
                }

                return;
            }

            if (errorToken) {
                setErrorToken(undefined);
            }

            setTokens(tokens.filter((token) => token.text !== ' ').map((token) => token.text));
        },
        [inputRef, errorToken],
    );

    const handleFindButtonClick = useCallback(() => {
        console.log(tokens);
    }, [tokens]);

    return (
        <div className={styles.tokensInputWrapper}>
            <div className={styles.tokensInput}>
                <input type="text" onChange={handleInputChange} ref={inputRef} />
                {errorToken &&
                    ReactDOM.createPortal(
                        <div
                            className={styles.errorPopup}
                            style={{ top: errorToken.rect.top + 40, left: errorToken.rect.left - 40 }}
                        >
                            {formatErrorText(errorToken.token.text, errorToken.errorDesc)}
                        </div>,
                        document.body,
                    )}
            </div>
            <div className={styles.serachButton}>
                <Button text="найти" isDisable={isSearchButtonDisable} onClick={handleFindButtonClick} />
            </div>
        </div>
    );
};
