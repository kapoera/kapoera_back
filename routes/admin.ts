import express from 'express';
import * as db from '../src/models/db';
import { gameType, GameModel, playingType } from '../src/models/game';
import { adminMiddleware } from '../middlewares/auth';
import { UserModel } from '../src/models/user';

const router = express.Router();

router.use(adminMiddleware);

router.post('/score', async (req: express.Request, res: express.Response) => {
  const { result, game_type } = req.body;

  try {
    await GameModel.findOneAndUpdate({ game_type }, { result });
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

router.post(
  '/playing-type',
  async (req: express.Request, res: express.Response) => {
    const { playing, game_type } = req.body;
    if (playing) {
      try {
        await GameModel.findOneAndUpdate({ game_type }, { playing });
        res.json({ success: true });
      } catch (error) {
        res.json({ success: false, message: error.message });
      }
    } else res.json({ success: false });
  }
);

router.post(
  '/end-game',
  async (req: express.Request, res: express.Response) => {
    const { winner, game_type } = req.body;
    if (winner) {
      try {
        await GameModel.findOne({ game_type }).then(async game => {
          if (game === null) res.json({ success: false });
          else {
            if (winner === 'K') {
              const scoreEach = game.dividend / game.kaist_arr.length;
              await UserModel.updateMany(
                { _id: { $in: game.kaist_arr } },
                { $inc: { score: scoreEach } }
              );
            } else if (winner === 'P') {
              const scoreEach = game.dividend / game.postech_arr.length;
              await UserModel.updateMany(
                { _id: { $in: game.postech_arr } },
                { $inc: { score: scoreEach } }
              );
            }
            res.json({ success: true });
          }
        });
      } catch (error) {
        res.json({ success: false, message: error.message });
      }
    } else res.json({ success: false });
  }
);

export default router;
