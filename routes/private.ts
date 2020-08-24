import express from 'express';
import { authMiddleware } from '../middlewares/auth';
import * as db from '../src/models/db';
import { UserModel } from '../src/models/user';
import { GameModel } from '../src/models/game';

const router = express.Router();

router.use(authMiddleware);

router.get('/check', (req: express.Request, res: express.Response) => {
  db.readUser(req.decoded.username)
    .then(users => {
      const { _id, __v, password, ...userinfo } = users[0].toObject();
      res.json({
        success: true,
        userinfo
      });
    })
    .catch(err => {
      res.json({ success: false, message: err.message });
    });
});

router.post(
  '/nickname',
  async (req: express.Request, res: express.Response) => {
    const { username } = req.decoded;
    const { nickname } = req.body;

    const exists = await UserModel.exists({ nickname });
    if (exists) {
      res.json({ success: false, message: 'nickname taken' });
    } else {
      try {
        await UserModel.findOneAndUpdate({ username }, { nickname });
        res.json({ success: true });
      } catch (error) {
        res.json({ success: false, message: error.message });
      }
    }
  }
);

router.post('/bet', async (req: express.Request, res: express.Response) => {
  const { username } = req.decoded;
  const { game_type, choice } = req.body;

  const user = await UserModel.findOne({ username });
  if (user === null) return res.status(400).send('User does not exist');

  const pushOption = {
    [choice === 'K' ? 'kaist_arr' : 'postech_arr']: user._id
  };

  try {
    await GameModel.update({ game_type }, { $addToSet: pushOption });
    res.json({ success: true });
  } catch (error) {
    res.status(500).send(error);
  }
});

export default router;
