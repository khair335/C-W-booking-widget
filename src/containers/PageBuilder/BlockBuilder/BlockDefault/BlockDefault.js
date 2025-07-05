import React from 'react';
import { func, node, object, shape, string } from 'prop-types';
import classNames from 'classnames';

import Field, { hasDataInFields } from '../../Field';
import BlockContainer from '../BlockContainer';

import css from './BlockDefault.module.css';
import { NamedLink, IconCollection } from '../../../../components';
import { useSelector } from 'react-redux';
import { AUDIENCE_USER_TYPE, CREATOR_USER_TYPE } from '../../../../util/types';
import { FormattedMessage } from 'react-intl';

const FieldMedia = props => {
  const { className, media, sizes, options } = props;
  const hasMediaField = hasDataInFields([media], options);
  return hasMediaField ? (
    <div className={classNames(className, css.media)}>
      <Field data={media} sizes={sizes} options={options} />
    </div>
  ) : null;
};

const BlockDefault = props => {
  const state = useSelector(state => state);
  const { currentUser } = state.user;

  const {
    blockId,
    className,
    rootClassName,
    mediaClassName,
    textClassName,
    ctaButtonClass,
    title,
    text,
    callToAction,
    media,
    responsiveImageSizes,
    options,
  } = props;
  const classes = classNames(rootClassName || css.root, className);
  const hasTextComponentFields = hasDataInFields([title, text, callToAction], options);
  const { userType } = (currentUser && currentUser.id && currentUser.attributes.profile.publicData) || {};

  return (
    <BlockContainer id={blockId} className={classes}>
      <FieldMedia
        media={media}
        sizes={responsiveImageSizes}
        className={mediaClassName}
        options={options}
      />
      {hasTextComponentFields ? (
        <div className={classNames(textClassName, css.text)}>
          {blockId !== 'faq-block' ? <Field data={title} options={options} /> : null}
          <Field data={text} options={options} />
          {blockId !== 'hero-block' ? (
            <Field data={callToAction} className={ctaButtonClass} options={options} />
          ) : (
            <div className={css.ctaButtons}>
              {userType == CREATOR_USER_TYPE ?
                <NamedLink name="ManageListingsPage" className={css.ctaButton}>
                  <span>
                    <FormattedMessage id="LandingPage.uploadContent" />
                  </span>
                </NamedLink>
                :
                  <NamedLink name={userType == AUDIENCE_USER_TYPE ? "AudienceProfileSettingsPage" : "SignupForUserTypePage"} params={userType == AUDIENCE_USER_TYPE ? { userType: AUDIENCE_USER_TYPE } : { userType: 'creator' }} className={css.ctaButton}><span>
                    <IconCollection icon="video-icon" /><FormattedMessage id="LandingPage.becomeCreator" /></span></NamedLink>
              }

              <NamedLink name="SearchPageOld" className={css.ctaButtonSecondary}><span>
                <IconCollection icon="search-icon" /><FormattedMessage id="LandingPage.discoverContent" /></span></NamedLink>

            </div>
          )}
        </div>
      ) : null}
    </BlockContainer>
  );
};

const propTypeOption = shape({
  fieldComponents: shape({ component: node, pickValidProps: func }),
});

BlockDefault.defaultProps = {
  className: null,
  rootClassName: null,
  mediaClassName: null,
  textClassName: null,
  ctaButtonClass: null,
  title: null,
  text: null,
  callToAction: null,
  media: null,
  responsiveImageSizes: null,
  options: null,
};

BlockDefault.propTypes = {
  blockId: string,
  className: string,
  rootClassName: string,
  mediaClassName: string,
  textClassName: string,
  ctaButtonClass: string,
  title: object,
  text: object,
  callToAction: object,
  media: object,
  responsiveImageSizes: string,
  options: propTypeOption,
};

export default BlockDefault;
