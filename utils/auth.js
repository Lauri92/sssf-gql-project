import jwt from 'jsonwebtoken';
import passport from '../utils/pass.js';

const checkAuth = (req) => {
  return new Promise((resolve) => {
    passport.authenticate('jwt', (err, user) => {
      if (err || !user) {
        resolve(false);
      }
      resolve(user);
    })(req);
  });
};

const login = (req) => {
  return new Promise((resolve, reject) => {
    passport.authenticate('local', {session: false}, (err, user, info) => {
      if (err || !user) {
        // Wrong credentials
        console.log(info);
        reject(info);
      }
      req.login(user, {session: false}, (err) => {
        if (err) {
          console.log(err);
          reject(err);
        }
        const token = jwt.sign(req.user, process.env.JWT_SECRET_OR_KEY);
        resolve({...user, token, id: user.id});
      });
    })(req);
  });
};

export {checkAuth, login};