
export const PRICE_TYPE_OWN = 'own';
export const PRICE_TYPE_SUGGESTED = 'suggested';

export const LISTING_TYPE_SERIES = 'series_products';
export const LISTING_TYPE_FILMS = 'film_products';
export const LISTING_TYPE_LIVE_EVENTS = 'live_event_products';
export const SUB_TITLE_SELECTION = 'pub_subtitleSelection';
export const FILM_SUB_GENRE = 'pub_subGenre';
export const SERIES_SUB_GENRE = 'pub_series_primary_genre';

export const SUB_TITLE_MAX = 4;
export const SUB_GENRE_MAX = 2;

// asset types
export const ASSET_MARKETING_POSTER = 'marketingPoster';
export const ASSET_MARKETING__BANNER = 'marketingBanner';
export const ASSET_MARKETING_TRAILER = 'marketingTrailer';
export const ASSET_EPISODE_THUMBNAIL = 'thumbnailFile';
export const ASSET_EPISODE_VIDEO = 'videoFile';
export const ASSET_FILM_VIDEO = 'filmVideo';
export const ASSET_USER_PROFILE_IMAGE = 'userProfileImage';
export const ASSET_USER_PROFILE_BANNER = 'userProfileBanner';

export const ASSET_CATEGORY_EPISODE = 'episode';
export const ASSET_CATEOGRY_MARKETING = 'marketing';
export const ASSET_CATEGORY_FILM = 'film';
export const ASSET_CATEOGRY_USER_PROFILE = 'userProfile';

// status
export const STATUS_PENDING_APPROVAL = 'pending-approval';
export const STATUS_UPLOAD_PENDING = 'upload-pending';
export const STATUS_UPLOAD_READY = 'ready';
export const STATUS_APPROVED = 'approved';
export const STATUS_DELETED = 'deleted';
export const STATUS_DOWNLOADING = 'downloading';
export const STATUS_PROCESSING = 'processing';
export const STATUS_VALIDATED = "validated";
export const STATUS_VALIDATING = "validating";
export const STATUS_GENERATING_SUBTITLE = 'generating-subtitles';
export const STATUS_QUEUED = 'queued';
export const STATUS_UPLOADING = 'uploading';

export const GUMLET_PROCESSING_STATUS = [
  STATUS_UPLOAD_PENDING,
  STATUS_PROCESSING,
  STATUS_DOWNLOADING,
  STATUS_VALIDATED,
  STATUS_VALIDATING,
  STATUS_GENERATING_SUBTITLE,
  STATUS_QUEUED
];

export const WASABI_ASSET = 'wasabi';
export const GUMLET_ASSET = 'gumlet';

export const GUMLET_ACCEPTED_VIDEO_FORMATS = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-matroska",
  "video/x-flv",
  "video/3gpp",
  "video/ogg"
];


export const NUMBER_OF_EPISODES = 'numberOfEpisodes';

export const SEARCHABLE_LISTING_ATTRIBUTES = [
  'listingType',
  'freeEpisode',
  ASSET_MARKETING_POSTER,
  ASSET_MARKETING_TRAILER,
  ASSET_MARKETING__BANNER,
  "series_primary_genre",
  "series_sub_genre",
  "rating",
  "episodeCount",
  "primary_genre",
  "sub_genre",
  "listingRating"
];


export const EPISODE_FIELD_SEQUENCE_NUMBER = 'sequenceNumber';
export const EPISODE_FIELD_TITLE = 'title';
export const EPISODE_FIELD_DESCRIPTION = 'description';


export const CATEGORY_FILTER = 'publicData.listingType';

export const LISTING_CATEGORY_FILTER = 'publicData.listingType';
export const PRIMARY_GENRE_FILTER = 'publicData.primary_genre';
export const PRICE_AMOUNT_FILTER = 'price.amount';
export const RATING_FILTER = 'publicData.rating';
export const EPISODE_COUNT_FILTER = 'publicData.episodeCount';
export const FREE_EPISODE_FILTER = 'publicData.freeEpisode';

export const TOTAL_FILMS_FILTER = 'totalFilms';
export const TOTAL_SERIES_FILTER = 'totalSeries';
export const EMAIL_VERIFIED_FILTER = 'emailVerified';


export const SEARCHABLE_CREATORS_ATTRIBUTES = [
  "firstName",
  "lastName",
  "displayName",
  "bio",
  "userName",
  "totalFilms",
  "totalSeries"
];

export const USER_TYPE_CREATOR = 'creator';
export const USER_TYPE_AUDIENCE = 'audience';

export const LISTING_SEARCH_ID = 'listing';
export const CREATOR_SEARCH_ID = 'creator';
export const ALL_SEARCH_ID = 'all';

export const FILTER_TYPE_REFINEMENT_LIST = 'refinementList';
export const FILTER_TYPE_MENU = 'menuList';
export const FILTER_RANGE_INPUT = 'range'

export const RECENTLY_ADDED = "Recently Added";
export const TRENDING_NOW = "Trending Now";

export const listingFilters = [
  { attribute: LISTING_CATEGORY_FILTER, label: "Cateogry", type: FILTER_TYPE_MENU },
  { attribute: PRICE_AMOUNT_FILTER, label: "Price", type: FILTER_RANGE_INPUT },
  { attribute: PRIMARY_GENRE_FILTER, label: "Genre", type: FILTER_TYPE_REFINEMENT_LIST },
  { attribute: RATING_FILTER, label: "Rating", type: FILTER_TYPE_REFINEMENT_LIST },
  { attribute: EPISODE_COUNT_FILTER, label: "Episode Count", type: FILTER_TYPE_REFINEMENT_LIST },
  { attribute: FREE_EPISODE_FILTER, label: "Free Episode", type: FILTER_TYPE_REFINEMENT_LIST }
];

export const filmFilters = [
  { attribute: LISTING_CATEGORY_FILTER, label: "Cateogry", type: FILTER_TYPE_MENU },
  { attribute: PRICE_AMOUNT_FILTER, label: "Price", type: FILTER_RANGE_INPUT },
  { attribute: PRIMARY_GENRE_FILTER, label: "Genre", type: FILTER_TYPE_REFINEMENT_LIST },
  { attribute: RATING_FILTER, label: "Rating", type: FILTER_TYPE_REFINEMENT_LIST },
];

export const creatorFilters = [
  { attribute: EMAIL_VERIFIED_FILTER, label: "Email Verified", type: FILTER_TYPE_REFINEMENT_LIST },
  { attribute: TOTAL_FILMS_FILTER, label: "Total Films", type: FILTER_TYPE_REFINEMENT_LIST },
  { attribute: TOTAL_SERIES_FILTER, label: "Total Series", type: FILTER_TYPE_REFINEMENT_LIST },
];

export const LISTING_STATE_DRAFT = 'draft';
export const LISTING_STATE_PUBLISHED = 'published';
export const USER_STATE_BANNED = 'banned';

export const LandingPageFilter = [
  { attribute: LISTING_CATEGORY_FILTER, label: 'CATEGORIES', type: FILTER_TYPE_REFINEMENT_LIST },
  { attribute: PRIMARY_GENRE_FILTER, label: 'ALL GENRES', type: FILTER_TYPE_REFINEMENT_LIST },
];

// Landing page section names.
export const HERO = "hero";
export const CUSTOM_FILTERS = "Custom Filters";
export const ALGOLIA_FILTERS = 'Algolia Filters';
export const NEW_RELEASES = "New Releases";
export const FILMS = 'Films';
export const SERIES = 'Series';
export const LIVE_EVENTS = 'Live Events';
export const FOR_YOU = 'For You';
export const TRENDING_CREATORS = 'Trending Creators';
export const CREATOR_SPOTLIGHT = 'Creator Spotlight';
export const FEATURED_CREATORS = 'Featured Creators';
export const CURRENTLY_WATCHING = 'Currently Watching';
export const MY_CREATORS = 'My Creators';

export const LANDING_PAGE_FILTER_TYPES = {
  [TRENDING_NOW]: TRENDING_NOW,
  [RECENTLY_ADDED]: RECENTLY_ADDED,
  [FILMS]: LISTING_TYPE_FILMS,
  [SERIES]: LISTING_TYPE_SERIES,
};

export const LANDING_PAGE_AUTHENTICATED_SECTIONS = [
  HERO,
  CUSTOM_FILTERS,
  ALGOLIA_FILTERS,
  NEW_RELEASES,
  FOR_YOU,
  TRENDING_CREATORS,
  SERIES,
  FILMS,
  FEATURED_CREATORS,
  CURRENTLY_WATCHING,
  MY_CREATORS
];

// SOCIAL MEDIA PLATFORMS
export const TWITTER = 'twitter_url';
export const INSTAGRAM = 'instagram_url';
export const FACEBOOK = 'facebook_url';
export const TIKTOK = 'tiktok_url';
export const YOUTUBE = 'youtube_url';
export const LINKEDIN = 'linkedIn_url';
export const WEBSITE = 'website_url';
export const X = 'x_url';
export const SPOTIFY = 'spotify_url';

export const VALID_SOCIAL_MEDIA_PLATFORMS = [TWITTER, INSTAGRAM, FACEBOOK, TIKTOK, YOUTUBE, LINKEDIN, WEBSITE, X, SPOTIFY];

export const SOCIAL_MEDIA_DOMAIN_MAPPER = {
  [TWITTER]: process.env.REACT_APP_X_BASE_URL,
  [INSTAGRAM]: process.env.REACT_APP_INSTAGRAM_BASE_URL,
  [FACEBOOK]: process.env.REACT_APP_FACEBOOK_BASE_URL,
  [TIKTOK]: process.env.REACT_APP_TIKTOK_BASE_URL,
  [YOUTUBE]: process.env.REACT_APP_YOUTUBE_BASE_URL,
  [LINKEDIN]: process.env.REACT_APP_LINKEDIN_BASE_URL,
  [X]: process.env.REACT_APP_X_BASE_URL,
  [SPOTIFY]: process.env.REACT_APP_SPOTIFY_BASE_URL,
};

// video status
export const ERRORED_STATUS = 'errored';

export const TYPE_UPLOAD_SUCCESS = 'uploadSuccess';
export const TYPE_UPLOAD_ERROR = 'uploadError';

// Klaviyo Creator Metrics
export const CREATOR_ACCOUNT_SIGNS_UP = "Creator Signs Up";
export const CREATOR_PROFILE_COMPLETED = "Creator Profile Completed";
export const CREATOR_UPDATES_PROFILE = 'Creator Updates Profile';
export const UPLOAD_COMPLETE = "Upload Complete";
export const CREATOR_SALE = "Creator Sale";

// Klaviyo User Metrics
export const USER_SIGN_UP = 'User Signs Up';
export const USER_FOLLOWED_CREATOR = 'User Followed Creator';
export const ADDED_TO_WISHLIST = 'Added to wishlist';
export const USER_UPDATES_PROFILE = 'User Updates Profile';
export const USER_PROFILE_COMPLETED = 'User Profile Completed';
export const CHECKOUT = 'Checkout';
export const PURCHASE_COMPLETED = 'Purchased Completed';
export const ABANDONED_CART = 'Abandoned Cart';
export const WATCHED_CONTENT = 'Watched Content';
export const VIEWED_PRODUCT = 'Viewed product';
export const RESET_PASSWORD_REQUESTED = 'Password Reset Requested';

// Reported issues 


export const REPORTED_ISSUES = (intl) => {

  return {
    unableToWatchMessage: intl.formatMessage({
      id: 'TransactionPanel.unableToWatch',
    }),
    notInLibraryMessage: intl.formatMessage({
      id: 'TransactionPanel.notInLibrary',
    }),
  }
};

export const ADMIN_EMAIL = process.env.REACT_APP_SENDGRID_ADMIN_EMAIL;
export const ADMIN_NAME = process.env.REACT_APP_SENDGRID_ADMIN_NAME;
export const TEMPLATED_ID_FOR_REFUND_REQUEST = process.env.REACT_APP_SEND_GRID_REFUND_REQUEST_NOTIFICATION_TO_ADMIN;
export const TEMPLATED_ID_FOR_REVIEW = process.env.REACT_APP_SEND_GRID_REVIEW_NOTIFICATION_TO_USER;

export const LISTING_ALGOLIA_UPDATE_STATES = ['pendingApproval', 'published'];


export const CODE_UPLOADING = 'uploading';
export const CODE_PROCESSING_MARKETING = 'processing-marketing';
export const CODE_PROCESSING_FILM = 'processing-film';
export const CODE_PROCESSING_SERIES = 'processing-series';

export const CATEGORY_CLICKED_EVENT = 'Category Clicked';
export const FACET_CLICKED_EVENT = 'Facet Clicked';

export const TAB_WISHLIST = 'wishlist';

export const CREATORS_PAGE = 'creatorPage';
export const CREATORS_ASSET_PAGE = 'creators-page';
export const POPULAR_CREATORS = 'Popular Creators';
export const NEW_TO_RABEL = 'New To Rabel';
export const RECENT_RELEASES = 'Recent Releases';
export const CREATOR_HERO = 'Creators Hero';
export const CREATOR_GENRE_FILTERS = 'Creator Genre Filters'

export const CREATORS_LANDING_PAGE_SECTIONS = [
  'Creators Hero',
  'Creator Genre Filters',
  'Popular Creators',
  'New To Rabel',
  'Recent Releases'
];

export const LANDING_PAGE = 'landing-page';

// Series Page Sections Name
export const SERIES_PAGE = 'series-page';
export const SERIES_HERO = 'series-hero';
export const GENRE_FILTERS = 'Genre Filters';
export const TRENDING_SERIES_CONTENT = 'Trending Series';
export const CREATORS_WITH_SERIES = 'Creators With Series';
export const NEWLY_RELEASED_SERIES = 'Newly Released Series';

export const SERIES_PAGE_AUTHENTICATED_SECTIONS = [
  SERIES_HERO,
  GENRE_FILTERS,
  TRENDING_SERIES_CONTENT,
  NEWLY_RELEASED_SERIES,
  CREATORS_WITH_SERIES
];


// Algolia Landing Page
export const CREATOR_INDEX = 'creators';
export const LISTING_INDEX = 'listings';

// Films page
export const FILMS_PAGE = 'films-page';
export const FILMS_HERO = 'films-hero';
export const FILMS_GENRE_FILTERS = 'Films Genre Filters';
export const FILMS_CREATORS_SECTION = 'Creators With Films';
export const TRENDING_FILMS = 'Trending Films';
export const NEWLY_RELEASED_FILMS = 'Newly Released Films';
export const FILMS_PAGE_AUTHENTICATED_SECTIONS = [
  FILMS_HERO,
  FILMS_GENRE_FILTERS,
];