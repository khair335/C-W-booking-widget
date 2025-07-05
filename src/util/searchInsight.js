import aa from 'search-insights';

const appId = process.env.REACT_APP_ALGOLIA_APP_ID;
const apiKey = process.env.REACT_APP_ALGOLIA_ADMIN_API_KEY;

aa('init', {
    appId,
    apiKey,
});

export const addedToWishlistObjectIDsAfterSearch = ({ userToken, eventName, index, queryID, objectIDs, value, currency }) => {
    aa('convertedObjectIDsAfterSearch', {
        userToken,
        eventName,
        index,
        queryID,
        objectIDs,
        value,
        currency
    });
};

export const addedToWishlistObjectIDs = ({ userToken, eventName, index, objectIDs, value, currency }) => {
    aa('convertedObjectIDs', {
        userToken,
        eventName,
        index,
        objectIDs,
        value,
        currency
    });
};

export const purchasedObjectIDsAfterSearch = ({ userToken, eventName, index, queryID, objectData, value, currency }) => {
    aa('purchasedObjectIDsAfterSearch', {
        userToken,
        eventName,
        index,
        objectIDs,
        objectData,
        value,
        currency,
        queryID,
    });
};

export const purchasedObjectIDs = ({ userToken, eventName, indexName, objectIDs, value, currency }) => {
    aa('purchasedObjectIDs', {
        userToken,
        eventName,
        index: indexName,
        objectIDs,
        value,
        currency
    });
}

export const clickedFilter = ({ userToken, index, eventName, filters }) => {
    aa('clickedFilters', {
        userToken,
        index,
        eventName,
        filters
    });
};

export const hitsViewed = ({ userToken, indexName, eventName, objectIDs }) => {
    aa('viewedObjectIDs', {
        userToken,
        index: indexName,
        eventName,
        objectIDs
    });
}

export default aa;

