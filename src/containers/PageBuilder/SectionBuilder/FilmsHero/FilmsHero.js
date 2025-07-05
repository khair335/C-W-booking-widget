import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FormattedMessage } from '../../../../util/reactIntl';
import { fetchFilmsHeroData, filmsHeroDataSelector } from '../../../FilmsPage/FilmsPage.duck';
import { Heading, IconCollection, NamedLink } from '../../../../components';
import css from './FilmsHero.module.css';


const FilmsHero = () => {
    const dispatch = useDispatch();
    const heroData = useSelector(filmsHeroDataSelector);

    const { title, background_image, description } = heroData?.[0] || {};

    useEffect(() => {
        dispatch(fetchFilmsHeroData());
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
                        <span><FormattedMessage id='FilmsPage.backToMarketplace' /></span>
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

export default FilmsHero;
