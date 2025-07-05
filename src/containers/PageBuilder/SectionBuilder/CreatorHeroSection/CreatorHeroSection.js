
import React, { useEffect } from 'react';
import { Heading, IconCollection, NamedLink } from '../../../../components';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { creatorsHeroDataSelector, fetchCreatorsHeroData } from '../../../CreatorLandingPage/CreatorLandingPage.duck';
import css from './CreatorHeroSection.module.css';

const CreatorHeroSection = () => {

    const dispatch = useDispatch();
    const heroData = useSelector(creatorsHeroDataSelector);
    
    const { title, background_image, description } = heroData?.[0] || {};

    useEffect(() => {
        dispatch(fetchCreatorsHeroData());
    }, []);

    const style = {
        backgroundImage: `url(${background_image?.url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        width: '100%',
    }

    return <div className={css.container} style={style}>
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
};

export default CreatorHeroSection;
