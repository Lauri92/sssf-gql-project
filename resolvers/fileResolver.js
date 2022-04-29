import User from '../models/userModel.js';
import Group from '../models/groupModel.js';
import GroupImage from '../models/groupImageModel.js';
import {GraphQLUpload} from 'graphql-upload';
import {finished} from 'stream/promises';
import {BlobServiceClient} from '@azure/storage-blob';
import {v4 as uuidv4} from 'uuid';

const profileImagesContainer = process.env.PROFILE_IMAGES_CONTAINER_NAME;
const groupAvatarsContainer = process.env.GROUP_AVATARS_CONTAINER_NAME;
const groupImagesContainer = process.env.GROUP_IMAGES_CONTAINER_NAME;
const storageAccountConnectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const blobServiceClient = BlobServiceClient.fromConnectionString(
    storageAccountConnectionString);

import * as fs from 'fs';
import {AuthenticationError} from 'apollo-server-express';
import InfoLink from '../models/infoLinkModel.js';

export default {

  Upload: GraphQLUpload,

  Mutation: {
    profilePictureUpload: async (parent, {file}, context) => {
      if (!context.user) {
        throw new AuthenticationError('You are not authorized');
      }
      const {createReadStream, filename, mimetype, encoding} = await file;

      if (mimetype.includes('image') ||
          mimetype.includes('application/octet-stream')) {
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
        throw new Error('Only image uploads are allowed');
      }

    },
    groupAvatarUpload: async (parent, {file}, context, args) => {
      if (!context.user) {
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
        try {
          const uploadedAvatarName = await handlegroupAvatar(createReadStream,
              group);

          await Group.findByIdAndUpdate(args.variableValues.groupId,
              {groupAvatarUrl: `${groupAvatarsContainer}/${uploadedAvatarName}`});

          return 'Successfully added avatar!';
        } catch (e) {
          throw new Error('Something went wrong uploading image');
        }
      } else {
        throw new Error('Only image uploads are allowed');
      }
    },
    groupImageUpload: async (parent, {file}, context, args) => {

      if (!context.user) {
        throw new AuthenticationError('You are not authorized');
      }

      const {createReadStream, filename, mimetype, encoding} = await file;

      if (mimetype.includes('image') ||
          mimetype.includes('application/octet-stream')) {
        const isUserPartOfGroup =
            await checkGroupMembers(
                args.variableValues.groupId,
                context.user.id,
            );

        if (!isUserPartOfGroup) {
          throw new AuthenticationError('You are not part of this group');
        }

        try {
          const uploadedGroupImageName = await handleNewGroupImage(
              createReadStream);

          const groupImage = await GroupImage.create({
            group: args.variableValues.groupId,
            user: context.user.id,
            urlStorageReference: uploadedGroupImageName,
            title: args.variableValues.title,
          });

          await Group.findOneAndUpdate(
              {_id: args.variableValues.groupId},
              {$push: {groupImages: groupImage._id}}, {new: true},
          );
          return 'Uploaded new group image';
        } catch (e) {
          throw new Error('Something went wrong uploading group image');
        }
      } else {
        throw new Error('Only image uploads are allowed');
      }
    },
  },

  Group: {
    groupImages: async (parent, args) => {
      return GroupImage.find(
          {_id: {$in: parent.groupImages}});
    },
  },
};

const handleNewGroupImage = async (createReadStream) => {

  const uuidFileName = await moveFileToUploads(createReadStream);

  await uploadNewFileToStorage(uuidFileName, groupImagesContainer);

  return uuidFileName;
};

const handlegroupAvatar = async (createReadStream, group) => {

  const uuidFileName = await moveFileToUploads(createReadStream);

  if (group.groupAvatarUrl !== undefined) {
    await deleteOldFileFromStorage(group.groupAvatarUrl, groupAvatarsContainer);
  }

  await uploadNewFileToStorage(uuidFileName, groupAvatarsContainer);

  return uuidFileName;
};

const handleProfileImage = async (createReadStream, userId) => {

  const uuidFileName = await moveFileToUploads(createReadStream);

  const user = await User.findById(userId);

  if (user.profileImageUrl !== undefined) {
    await deleteOldFileFromStorage(user.profileImageUrl,
        profileImagesContainer);
  }

  await uploadNewFileToStorage(uuidFileName, profileImagesContainer);

  return uuidFileName;
};

const checkGroupMembers = async (groupid, userId) => {
  const group = await Group.findById(groupid);
  const groupObj = group.toObject();
  const usersAndAdmin = groupObj.members.map(member => {
    return member.toString();
  });
  usersAndAdmin.push(group.admin.toString());
  return usersAndAdmin.includes(userId);
};

const moveFileToUploads = async (createReadStream) => {
  const stream = createReadStream();
  const uuidFileName = await uuidv4();
  const out = await fs.createWriteStream(`uploads/${uuidFileName}`);
  stream.pipe(out);
  await finished(out);

  return uuidFileName;
};

const uploadNewFileToStorage = async (uuidFileName, containerName) => {
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

const deleteOldFileFromStorage = async (blobContext, containerName) => {
  const blobToDelete = blobContext.match(/\/(.*)/)[1];
  const container = await blobServiceClient.getContainerClient(
      containerName);
  await container.deleteBlob(blobToDelete);
};