import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSeriesHeroData, seriesHeroDataSelector } from '../../../SeriesPage/SeriesPage.duck';
import { Heading, IconCollection, NamedLink } from '../../../../components';
import { FormattedMessage } from '../../../../util/reactIntl';
import css from './SeriesHero.module.css';

const SeriesHero = () => {
    const dispatch = useDispatch();
    const heroData = useSelector(seriesHeroDataSelector);

    const { title, background_image, description } = heroData?.[0] || {};

    useEffect(() => {
        dispatch(fetchSeriesHeroData());
    }, []);

    const style = {
        backgroundImage: `url(${background_image?.url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        width: '100%',
    }

    return (
        <div className={css.container} style={style}>
            <div className={css.heroSectionContent}>
                <div className={css.backToMarketplace}>
                    <IconCollection icon="icon-back" />
                    <NamedLink name="LandingPage">
                        <span><FormattedMessage id='SeriesPage.backToMarketplace' /></span>
                    </NamedLink>
                </div>
                <div>
                    <Heading className={css.title}>{title}</Heading>
                    <h3 className={css.description}>{description}</h3>
                </div>
            </div>
        </div>
    );
};

export default SeriesHero;
