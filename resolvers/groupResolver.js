'use strict';
import Group from '../models/groupModel.js';
import Link from '../models/infoLinkModel.js';
import User from '../models/userModel.js';
import GroupImageModel from '../models/groupImageModel.js';
import {AuthenticationError, UserInputError} from 'apollo-server-express';
import {BlobServiceClient} from '@azure/storage-blob';

const blobServiceClient = BlobServiceClient.fromConnectionString(
    process.env.AZURE_STORAGE_CONNECTION_STRING);
const groupImagesContainer = await blobServiceClient.getContainerClient(
    process.env.GROUP_IMAGES_CONTAINER_NAME);
const groupAvatarsContainer = await blobServiceClient.getContainerClient(
    process.env.GROUP_AVATARS_CONTAINER_NAME);

export default {

  Query: {
    getGroup: async (parent, args, context) => {

      if (!context.user) {
        throw new AuthenticationError('You are not authorized');
      }

      const requestedGroup = await Group.findById(args.id);
      const requestedGroupAdmin = requestedGroup.admin.toString();
      const requestedGroupMembers = requestedGroup.members.map(member => {
        return member.toString();
      });

      if (requestedGroupAdmin === context.user.id ||
          requestedGroupMembers.includes(context.user.id)) {
        return requestedGroup;
      }
      throw new AuthenticationError('You are not part of this group!');
    },
    getGroupsByUserId: async (parent, args, context) => {
      if (!context.user) {
        throw new AuthenticationError('You are not authorized');
      }
      return Group.find(
          {
            $or: [
              {admin: context.user.id},
              {
                members: {$in: context.user.id},
              }],
          });
    },
  },

  Mutation: {
    addGroup: async (parent, args, context) => {
      if (!context.user) {
        throw new AuthenticationError('You are not allowed to create groups!');
      }
      if (args.name.length > 15 || args.name.length < 3 ||
          args.description.length > 50 || args.description.length < 3) {
        throw new Error('Check input lengths');
      }
      return await Group.create({
        admin: context.user.id,
        name: args.name,
        description: args.description,
      });
    },
    addUserToGroup: async (parent, args, context) => {

      if (!context.user) {
        throw new AuthenticationError(
            'You are not allowed to add users to groups!');
      }

      const chosenGroup = await Group.findById(args.groupId);

      if (chosenGroup.admin.toString() === context.user.id) {
        if (!chosenGroup.members.includes(args.userId)) {
          return Group.findOneAndUpdate(
              {_id: args.groupId},
              {$push: {members: args.userId}}, {new: true},
          );
        }
        throw new UserInputError('User already exists in the group');
      } else {
        throw new AuthenticationError('Only Admin can add users');
      }
    },
    removeUserFromGroup: async (parent, args, context) => {
      if (!context.user) {
        throw new AuthenticationError('You are not authorized');
      }
      const group = await Group.findById(args.groupId);
      if (group.admin.toString() === context.user.id) {
        try {
          await Group.findOneAndUpdate(
              {_id: args.groupId},
              {$pull: {members: args.userId}},
          );
          return 'Removed user from group';
        } catch (e) {
          throw new Error('Failed to remove user from group');
        }
      } else {
        throw new Error('You are not the group admin');
      }
    },
    userSelfLeaveGroup: async (parent, args, context) => {
      if (!context.user) {
        throw new AuthenticationError('You are not authorized');
      }
      try {
        await Group.findOneAndUpdate(
            {_id: args.groupId},
            {$pull: {members: context.user.id}});
        return 'Group left successfully';
      } catch (e) {
        throw new Error('Failed to leave group.');
      }
    },
    updateGroup: async (parent, args, context) => {
      if (!context.user) {
        throw new AuthenticationError('You are not authorized');
      }
      if (args.name.length > 15 || args.description.length > 50) {
        throw new Error('Check input lengths');
      }
      const group = await Group.findById(args.groupId);
      if (context.user.id !== group.admin.toString()) {
        throw new AuthenticationError('You are not the admin.');
      }
      try {
        return await Group.findOneAndUpdate(
            {_id: args.groupId},
            {name: args.name, description: args.description}, {new: true});
      } catch (e) {
        throw new Error('Something went wrong updating');
      }
    },
    deleteGroupImage: async (parent, args, context) => {

      if (!context.user) {
        throw new AuthenticationError('You are not authorized');
      }

      const user = context.user.id;
      const group = await Group.findById(args.groupId);
      const groupImage = await GroupImageModel.findById(args.groupImageId);

      const groupAdmin = group.admin.toString();
      const groupImageSubmitter = groupImage.user.toString();

      if (user === groupAdmin || user === groupImageSubmitter) {
        try {
          const storagecontainerFileName = groupImage.urlStorageReference.match(
              /\/(.*)/)[1];
          await groupImagesContainer.deleteBlob(storagecontainerFileName);

          await Group.findOneAndUpdate(
              {_id: args.groupId},
              {$pull: {groupImages: args.groupImageId}},
          );

          await GroupImageModel.findOneAndDelete({_id: args.groupImageId});

          return 'Removed group image';
        } catch (e) {
          throw new Error('Something went wrong deleting image');
        }

      } else {
        throw new AuthenticationError(
            'You are not allowed to delete this image');
      }

    },
    deleteGroup: async (parent, args, context) => {
      if (!context.user) {
        throw new AuthenticationError('You are not authorized');
      }

      const group = await Group.findById(args.groupId);

      if (context.user.id !== group.admin.toString()) {
        throw new Error('Only the admin can delete the group!');
      }

      const links = group.links.map(link => {
        return link.toString();
      });
      const groupImageIds = group.groupImages.map(image => {
        return image.toString();
      });

      let groupAvatarUrl = group.groupAvatarUrl;

      const groupImageObjects = await GroupImageModel.find({
        _id: {$in: groupImageIds},
      });

      const groupImageContainerFileNames = groupImageObjects.map(
          object => {
            return object.urlStorageReference.match(
                /\/(.*)/)[1];
          });

      try {

        if (groupAvatarUrl !== undefined) {
          groupAvatarUrl = groupAvatarUrl.match(
              /\/(.*)/)[1];
          await groupAvatarsContainer.deleteBlob(groupAvatarUrl);
        }

        for (const groupImage of groupImageContainerFileNames) {
          await groupImagesContainer.deleteBlob(groupImage);
        }

        await GroupImageModel.deleteMany({_id: groupImageIds});

        await Link.deleteMany({_id: links});

        await Group.deleteOne({_id: args.groupId});

        return 'Group deleted';
      } catch (e) {
        throw new Error('Something went wrong deleting group');
      }

    },
  },
};