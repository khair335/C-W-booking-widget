import { io } from "socket.io-client";
import { ASSET_CATEGORY_EPISODE, ASSET_CATEGORY_FILM, ASSET_CATEOGRY_MARKETING, ASSET_EPISODE_VIDEO, ASSET_FILM_VIDEO, ASSET_MARKETING_TRAILER } from "../constants";
import { UPDATE_EPISODE_ASSET, UPDATE_FILM_ASSET, UPDATE_MARKETING_ASSET } from "../ducks/user.duck";

let socket;

export const initializeSocket = (store) => {
  if (!socket) {;
    const mode = process.env.NODE_ENV;

    const apiUrl = mode === 'development' ? 'http://localhost:3900' : process.env.REACT_APP_MARKETPLACE_ROOT_URL;

    socket = io(apiUrl, { withCredentials: true });


    socket.on("connect", () => {
      console.log("Connected to server with ID:", socket.id);
    });

    // Handle incoming events and dispatch actions to Redux
    socket.on('gumlet-event', (data) => {
      console.log('Received event:', data);
      const { assetName, assetCategory } = data || {};
    
      if (assetName === ASSET_MARKETING_TRAILER && assetCategory === ASSET_CATEOGRY_MARKETING) {
        return store.dispatch({ type: UPDATE_MARKETING_ASSET, payload: { ...data, assetName } });
      };

      // Disabled for now
      if (assetName === ASSET_EPISODE_VIDEO && assetCategory === ASSET_CATEGORY_EPISODE) {
        return store.dispatch({ type: UPDATE_EPISODE_ASSET, payload: { ...data, assetName } });
      };

      if (assetName === ASSET_FILM_VIDEO && assetCategory === ASSET_CATEGORY_FILM) {
        return store.dispatch({ type: UPDATE_FILM_ASSET, payload: { ...data, assetName } });
      };
    });
  }

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    console.warn('Socket.IO has not been initialized. Call initializeSocket first.');
  }
  return socket;
};
