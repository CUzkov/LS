import React, { useMemo } from 'react';
import type { FC } from 'react';
import cn from 'classnames';

import styles from './style.scss';

const SIDE_SHOW_PAGE = 2;
//     SIDE_SHOW_PAGE * 2
//       |  |     |  |
// 1 -1 12 13 14 15 16 -1 20
// 1  2        3        4  5
const MAIN_ITEMS_QUANTITY = 5 + SIDE_SHOW_PAGE * 2;

type PaginatorProps = {
    page: number;
    pageQuantity: number;
    onChangePage: (value: number) => void;
};

export const Paginator: FC<PaginatorProps> = ({ page, pageQuantity, onChangePage }) => {
    const itemsForRender = useMemo(() => {
        let itemsForRender: number[] = [];

        for (let i = page - SIDE_SHOW_PAGE; i < page + SIDE_SHOW_PAGE + 1; i++) {
            itemsForRender.push(i);
        }

        itemsForRender = itemsForRender.filter((item) => item > 0 && item <= pageQuantity);

        if (itemsForRender.length === pageQuantity) {
            return itemsForRender;
        }

        if (itemsForRender[0] === 2) {
            itemsForRender.unshift(1);
        }

        if (itemsForRender[itemsForRender.length - 1] === pageQuantity - 1) {
            itemsForRender.push(pageQuantity);
        }

        if (itemsForRender.length === pageQuantity) {
            return itemsForRender;
        }

        if (itemsForRender[0] === 1) {
            const needAdd = MAIN_ITEMS_QUANTITY - itemsForRender.length - 2;

            for (let i = 0; i < needAdd; i++) {
                if (itemsForRender.length < pageQuantity) {
                    itemsForRender.push(itemsForRender[itemsForRender.length - 1] + 1);
                }
            }
        }

        if (itemsForRender.length === pageQuantity) {
            return itemsForRender;
        }

        if (itemsForRender[itemsForRender.length - 1] === pageQuantity) {
            const needAdd = MAIN_ITEMS_QUANTITY - itemsForRender.length - 2;

            for (let i = 0; i < needAdd; i++) {
                if (itemsForRender.length < pageQuantity) {
                    itemsForRender.unshift(itemsForRender[0] - 1);
                }
            }
        }

        if (itemsForRender.length === pageQuantity) {
            return itemsForRender;
        }

        if (itemsForRender[0] !== 1) {
            if (itemsForRender?.[0] !== 2 && itemsForRender?.[0] !== 3) {
                itemsForRender.unshift(-1);
            } else {
                if (itemsForRender?.[0] === 3) {
                    itemsForRender.unshift(2);
                }
            }

            itemsForRender.unshift(1);
        }

        if (itemsForRender[itemsForRender.length - 1] !== pageQuantity) {
            if (
                itemsForRender?.[itemsForRender.length - 1] !== pageQuantity - 1 &&
                itemsForRender?.[itemsForRender.length - 1] !== pageQuantity - 2
            ) {
                itemsForRender.push(-1);
            } else {
                if (itemsForRender?.[itemsForRender.length - 1] === pageQuantity - 2) {
                    itemsForRender.push(pageQuantity - 1);
                }
            }
            itemsForRender.push(pageQuantity);
        }

        return itemsForRender;
    }, [page, pageQuantity]);

    return (
        <div className={styles.paginator}>
            {itemsForRender.map((item, i) => (
                <div
                    key={i}
                    className={cn(
                        styles.paginatorItem,
                        item === -1 && styles.noInteract,
                        item === page && styles.active,
                    )}
                    onClick={() => (item !== page ? onChangePage(item) : undefined)}
                >
                    <div className={styles.paginatorItemContent}>{item === -1 ? '...' : item}</div>
                </div>
            ))}
        </div>
    );
};
