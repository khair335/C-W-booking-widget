import { v4 as uuidv4 } from 'uuid';
import { createGumletAssetApi, createWasAbiAssetApi, getGumletPartUploadUrl, gumletMultipartComplete } from './api';
import { STATUS_PROCESSING } from '../constants';
import axios from 'axios';

export const uploadFileToWasAbi = ({ file, assetName, listingId }) => {
  const bucketName = process.env.REACT_APP_WASABI_BUCKET; // Replace with your bucket name
  const fileName = `${uuidv4()}-${file.name}`;

  return createWasAbiAssetApi({ fileName, bucketName, tags: { assetName, listingId } })
    .then(({ uploadUrl }) => {
      return fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type // Set the correct MIME type for the file
        },
        body: file // The file data from the input
      })
    });
};

export const uploadFileToGumlet = async ({ 
  file, 
  listingId, 
  assetName, 
  episodeId, 
  assetCategory, 
  assetTitle, 
  subtitleLanguages = [], 
  progressHandler 
}) => {
  try {
    // Step 1: Create Gumlet asset
    const { data } = await createGumletAssetApi({
      listingId, 
      assetName, 
      episodeId, 
      assetCategory, 
      assetTitle, 
      subtitleLanguages
    });

    const { asset_id, output, input } = data;

    if (!asset_id) {
      throw new Error("Failed to create Gumlet asset. Please try again.");
    }

    // Step 2: Split the file into parts
    const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const etags = [];

    for (let partNumber = 1; partNumber <= totalChunks; partNumber++) {
      const start = (partNumber - 1) * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const fileChunk = file.slice(start, end);

      // Step 3: Get pre-signed URL for the part
      const { data: partData } = await getGumletPartUploadUrl({ asset_id, partNumber });
      const { part_upload_url } = partData;

      // Step 4: Upload the part
      const response = await axios.put(part_upload_url, fileChunk, {
        headers: { "Content-Type": file.type },
        onUploadProgress: (progressEvent) => {
          if (progressHandler) {
            const totalUploaded = start + progressEvent.loaded;
            const percent = Math.round((totalUploaded * 100) / file.size);
            progressHandler(percent);
          }
        }
      });

      // Step 5: Store the ETag value from the response
      const eTag = response.headers.etag;
      etags.push({ PartNumber: partNumber, ETag: eTag });
    }

    const { playback_url, thumbnail_url } = output || {};
    const { profile_id, duration } = input || {};

    // Step 6: Complete multipart upload
    await gumletMultipartComplete({
      asset_id, parts: etags, episodeId, assetCategory, listingId,
      assetName, assetStatus: STATUS_PROCESSING, playback_url, thumbnail_url,
      profile_id, duration, subtitle: []
    });

    return {
      asset_id,
      playback_url: playback_url,
      status: STATUS_PROCESSING, // Assuming status is "PROCESSING" after a successful upload
      thumbnail_url: thumbnail_url[0],
      profile_id,
      duration,
      listingId
    };
  } catch (error) {
    console.error("Error uploading large file:", error);
    throw error;
  }
};


