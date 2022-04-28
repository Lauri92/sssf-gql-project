import User from '../models/userModel.js';
import Group from '../models/groupModel.js';
import {GraphQLUpload} from 'graphql-upload';
import {finished} from 'stream/promises';
import {BlobServiceClient} from '@azure/storage-blob';
import {v4 as uuidv4} from 'uuid';

const profileImagesContainer = process.env.PROFILE_IMAGES_CONTAINER_NAME;
const groupAvatarsContainer = process.env.GROUP_AVATARS_CONTAINER_NAME;
const storageAccountConnectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const blobServiceClient = BlobServiceClient.fromConnectionString(
    storageAccountConnectionString);

import * as fs from 'fs';
import {AuthenticationError} from 'apollo-server-express';

export default {

  Upload: GraphQLUpload,

  Mutation: {
    profilePictureUpload: async (parent, {file}, context) => {
      console.log('A request made it here!');
      if (!context.user) {
        console.log('Not authorized');
        throw new AuthenticationError('You are not authorized');
      }
      console.log('Was authorized!');
      const {createReadStream, filename, mimetype, encoding} = await file;

      console.log('File: ', file);
      if (mimetype.includes('image') ||
          mimetype.includes('application/octet-stream')) {
        console.log('Was image!');
        try {
          const uploadedImageName = await handleProfileImage(createReadStream,
              context.user.id);
          await User.findByIdAndUpdate(context.user.id,
              {profileImageUrl: `${profileImagesContainer}/${uploadedImageName}`});
          return {filename, mimetype, encoding};
        } catch (e) {
          console.log(e.message);
          throw new Error('Something went wrong uploading image');
        }
      } else {
        console.log('Not an image!');
        throw new Error('Only image uploads are allowed');
      }

    },
    groupAvatarUpload: async (parent, {file}, context, args) => {
      console.log('Variable values: ', args.variableValues);
      if (!context.user) {
        console.log('Not authorized');
        throw new AuthenticationError('You are not authorized');
      }
      const {createReadStream, filename, mimetype, encoding} = await file;

      const group = await Group.findById(args.variableValues.groupId);
      const groupAdmin = group.admin.toString();
      if (context.user.id !== groupAdmin) {
        throw new AuthenticationError(
            'You are not allowed to post group avatar');
      }

      if (mimetype.includes('image') ||
          mimetype.includes('application/octet-stream')) {
        console.log('Was image!');
        try {
          const uploadedAvatarName = await handlegroupAvatar(createReadStream,
              group);

          await Group.findByIdAndUpdate(args.variableValues.groupId,
              {groupAvatarUrl: `${groupAvatarsContainer}/${uploadedAvatarName}`});

          return 'Successfully added avatar!';
        } catch (e) {
          console.log(e.message);
          throw new Error('Something went wrong uploading image');
        }
      } else {
        console.log('Not an image!');
        throw new Error('Only image uploads are allowed');
      }
    },
  },

};

const handlegroupAvatar = async (createReadStream, group) => {
  const stream = createReadStream();
  const uuidFileName = await uuidv4();
  const out = await fs.createWriteStream(`uploads/${uuidFileName}`);
  stream.pipe(out);
  await finished(out);

  if (group.groupAvatarUrl !== undefined) {
    await deleteOldGroupAvatarFromStorage(group);
  }

  await uploadNewGroupAvatar(uuidFileName);

  return uuidFileName;
};

const uploadNewGroupAvatar = async (uuidFileName) => {
  const containerClient = await blobServiceClient.getContainerClient(
      groupAvatarsContainer);
  await containerClient.createIfNotExists();
  const filePath = `uploads/${uuidFileName}`;
  const blockBlobClient = await containerClient.getBlockBlobClient(
      uuidFileName);
  await blockBlobClient.uploadFile(filePath);
  await fs.unlink(filePath, err => {
    if (err) throw err;
  });
};

const deleteOldGroupAvatarFromStorage = async (group) => {
  const context = group.groupAvatarUrl;
  const blobToDelete = context.match(/\/(.*)/)[1];
  const container = await blobServiceClient.getContainerClient(
      groupAvatarsContainer);
  await container.deleteBlob(blobToDelete);
};

const handleProfileImage = async (createReadStream, userId) => {

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
      profileImagesContainer);
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
  const container = await blobServiceClient.getContainerClient(
      profileImagesContainer);
  await container.deleteBlob(blobToDelete);
};