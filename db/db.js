import mongoose from 'mongoose';

const connectMongo = async () => {
  try {
    return await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (e) {
    console.log('Connection to db failed: ' + e);
  }
};

export default connectMongo;
