import User from '../models/userModel.js';
import {GraphQLUpload} from 'graphql-upload';
import {finished} from 'stream/promises';
import {BlobServiceClient} from '@azure/storage-blob';
import {v4 as uuidv4} from 'uuid';

const containerName = process.env.CONTAINER_NAME;
const storageAccountConnectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const blobServiceClient = BlobServiceClient.fromConnectionString(
    storageAccountConnectionString);

import * as fs from 'fs';
import {AuthenticationError} from 'apollo-server-express';

export default {

  Upload: GraphQLUpload,

  Mutation: {
    profilePictureUpload: async (parent, {file}, context) => {

      if (!context.user) {
        throw new AuthenticationError('You are not authorized');
      }
      const {createReadStream, filename, mimetype, encoding} = await file;

      if (mimetype.includes('image')) {
        try {
          const uploadedImageName = await uploadImage(createReadStream,
              context.user.id);
          await User.findByIdAndUpdate(context.user.id,
              {profileImageUrl: `${containerName}/${uploadedImageName}`});
          return {filename, mimetype, encoding};
        } catch (e) {
          console.log(e.message);
          throw new Error('Something went wrong uploading image');
        }
      } else {
        throw new Error('Only image uploads are allowed');
      }

    },
  },

};

const uploadImage = async (createReadStream, userId) => {

  const stream = createReadStream();
  const uuidFileName = await uuidv4();
  const out = await fs.createWriteStream(`uploads/${uuidFileName}`);
  stream.pipe(out);
  await finished(out);

  const user = await User.findById(userId);

  if (user.profileImageUrl !== undefined) {
    await deleteOldProfileImageFromStorage(user);
  }

  await uploadNewProfileImage(uuidFileName);

  return uuidFileName;
};

const uploadNewProfileImage = async (uuidFileName) => {
  const containerClient = await blobServiceClient.getContainerClient(
      containerName);
  await containerClient.createIfNotExists();
  const filePath = `uploads/${uuidFileName}`;
  const blockBlobClient = await containerClient.getBlockBlobClient(
      uuidFileName);
  await blockBlobClient.uploadFile(filePath);
  await fs.unlink(filePath, err => {
    if (err) throw err;
  });
};

const deleteOldProfileImageFromStorage = async (user) => {
  const context = user.profileImageUrl;
  const blobToDelete = context.match(/\/(.*)/)[1];
  const container = await blobServiceClient.getContainerClient(containerName);
  await container.deleteBlob(blobToDelete);
};