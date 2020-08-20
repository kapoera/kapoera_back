import jwt from 'jsonwebtoken';
import { secretObj } from '../config/secret';
import { Tokens } from './type';
export let refreshTokens: Array<any> = [];

export function createAccessToken(username: string, nickname: string) {
  const token = new Promise((resolve, reject) => {
    jwt.sign(
      { username: username, nickname: nickname },
      secretObj.secret,
      { expiresIn: '15m', subject: 'userinfo', algorithm: 'HS256' },
      (err, token) => {
        if (err) reject(err);
        resolve(token);
      }
    );
  });
  return token;
}

export function createRefreshToken(username: string, nickname: string) {
  const token = new Promise((resolve, reject) => {
    jwt.sign(
      { username: username, nickname: nickname },
      secretObj.secret,
      { expiresIn: '14d', subject: 'userinfo', algorithm: 'HS256' },
      (err, token) => {
        if (err) reject(err);
        resolve(token);
      }
    );
  });
  return token;
}

export const createTokens = (
  username: string,
  nickname: string
): Promise<Tokens> => {
  return new Promise((resolve, reject) => {
    createAccessToken(username, nickname)
      .then(accessToken => {
        createRefreshToken(username, nickname)
          .then(refreshToken => {
            refreshTokens.push(refreshToken);
            resolve(<Tokens>{
              accessToken: accessToken,
              refreshToken: refreshToken
            });
          })
          .catch(err => {
            console.log(err.message);
            reject(<Tokens>{ accessToken: 'fail', refreshToken: 'fail' });
          });
      })
      .catch(err => {
        console.log(err.message);
        reject(<Tokens>{ accessToken: 'fail', refreshToken: 'fail' });
      });
  });
};
