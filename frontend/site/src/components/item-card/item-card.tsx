import React, { FC, useMemo } from 'react';
import { Link } from 'react-router-dom';

import { useSelector } from 'store';
import { Badge, BadgeColors, RWAtobadgeColor } from 'components/badge';
import { RWA } from 'types';

import styles from './style.scss';

type ItemCardProps = {
    title: string;
    link: string;
    access: RWA;
    byUsername: string;
    isPrivate: boolean;
    byUserId: number;
};

export const ItemCard: FC<ItemCardProps> = ({ title, link, byUserId, byUsername, isPrivate, access }) => {
    const { userId } = useSelector((root) => root.user);

    const badges = useMemo(
        () =>
            [
                {
                    title: `by ${byUserId === userId ? 'you' : byUsername}`,
                    color: BadgeColors.white,
                },
                {
                    title: (access == RWA.none ? 'no access' : access) ?? '',
                    color: RWAtobadgeColor(access ?? RWA.none),
                },
                isPrivate
                    ? {
                          title: 'приватный',
                          color: BadgeColors.red,
                      }
                    : undefined,
            ].filter(Boolean),
        [access, isPrivate, byUsername, byUserId],
    );

    return (
        <div className={styles.itemCard}>
            <div>
                <Link to={link} className={styles.title}>
                    {title}
                </Link>
                <div className={styles.badges}>
                    {badges.map((badge, i) => (
                        <Badge {...(badge as { title: string; color: BadgeColors })} key={i} />
                    ))}
                </div>
            </div>
        </div>
    );
};
