import React from 'react';
import { FACEBOOK, INSTAGRAM, LINKEDIN, SOCIAL_MEDIA_DOMAIN_MAPPER, SPOTIFY, TIKTOK, WEBSITE, X, YOUTUBE } from '../../constants';
import IconCollection from '../IconCollection/IconCollection';
import { ensureHttps } from '../../util/data';

const preparePlatformsData = (socialKeys, publicData) => {
  const socialMediaIcons = {
    [FACEBOOK]: {
      icon: <IconCollection icon="fa-facebook" />,
    },
    [INSTAGRAM]: {
      icon: <IconCollection icon="fa-instagram" />,
    },
    [TIKTOK]: {
      icon: <IconCollection icon="fa-tiktok" />,
    },
    [YOUTUBE]: {
      icon: <IconCollection icon="fa-youtube" />,
    },
    [LINKEDIN]: {
      icon: <IconCollection icon="fa-linkedIn" />,
    },
    [WEBSITE]: {
      icon: <IconCollection icon="fa-website" />,
    },
    [X]: {
      icon: <IconCollection icon="fa-twitter" />,
    },
    [SPOTIFY]: {
      icon: <IconCollection icon="fa-spotify" />,
    },
  };

  return socialKeys.map(platform => ({ ...socialMediaIcons[platform], url: `${SOCIAL_MEDIA_DOMAIN_MAPPER[platform] || ''}${publicData[platform]}` }));
};

const SocialShareButton = ({ key, url, icon, pointer }) => {
  const handleClick = () => {
    return typeof window !== undefined && window.open(url, 'target', `noopener,noreferrer`);
  };

  return (
    <div key={key} onClick={handleClick}>
      <p className={pointer}>{icon}</p>
    </div>
  );
};

const SocialShare = ({ currentUser, pointer }) => {
  const { publicData = {} } = currentUser?.attributes?.profile || {};
  const keys = Object.keys(publicData);
  const socialKeys = keys.filter(key => key.includes('_url'));
  const platformsToShow = preparePlatformsData(socialKeys, publicData);

  return platformsToShow.map(({ url, icon }) => (
    <SocialShareButton key={url} url={ensureHttps(url)} icon={icon} pointer={pointer} />
  ));
};

export default SocialShare;
