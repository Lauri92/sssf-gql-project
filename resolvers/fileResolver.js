import {GraphQLUpload} from 'graphql-upload';
import {finished} from 'stream/promises';
import {BlobServiceClient} from '@azure/storage-blob';
import {v4 as uuidv4} from 'uuid';

const containerName = process.env.CONTAINER_NAME;
const storageAccountConnectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const blobServiceClient = BlobServiceClient.fromConnectionString(
    storageAccountConnectionString);

import * as fs from 'fs';

export default {

  Upload: GraphQLUpload,

  Mutation: {
    singleUpload: async (parent, {file}) => {
      const {createReadStream, filename, mimetype, encoding} = await file;

      if (mimetype.includes('image')) {
        const stream = createReadStream();
        const newName = await uuidv4();
        const out = await fs.createWriteStream(`uploads/${newName}`);
        stream.pipe(out);
        await finished(out);

        const containerClient = await blobServiceClient.getContainerClient(
            containerName);
        await containerClient.createIfNotExists();
        const filePath = `uploads/${newName}`;
        const blockBlobClient = await containerClient.getBlockBlobClient(
            newName);
        await blockBlobClient.uploadFile(filePath);
        await fs.unlink(filePath, err => {
          if (err) throw err;
        });
      }
      return {filename, mimetype, encoding};
    },
  },

};