import { Types } from 'mongoose';
import User from '../models/users.model';
import { createError } from '../utils/util';
import statusCodes from '../utils/statusCodes';
import { IControllerData } from 'interfaces/common.interface';

class UserModule {

  /**
   * Search user by id or username 
   */
  public getUser = async ({ search }: IControllerData) => {
    try {
      let query: any = { username: search };
      if (Types.ObjectId.isValid(search)) {
        query = { _id: Types.ObjectId(search) };
      }

      const user = await User.findOne(query).populate({
        path: 'followers',
        select: 'email username followers displayName'
      });
      if (!user) {
        throw createError(
          statusCodes.UNAUTHORIZED,
          'No user with that email registered'
        );
      }
      
      return user.getPublicData();
    } catch (err) {
      throw err;
    }
  }

  public followUser = async ({ username, _req: { auth } }: IControllerData) => {
    try {
      const [userId] = await User.distinct('_id', { username });
      if (!userId) {
        throw createError(
          statusCodes.UNAUTHORIZED,
          'No user with that email registered'
        );
      }
      if (auth._id.equals(userId)) {
        throw createError(
          statusCodes.BAD_REQUEST,
          'You can\'t follow yourself'
        );
      }

      auth.followers = auth.followers || [];

      const index = auth.followers.findIndex(uid => uid.equals(userId));
      const alreadyFollowed = index > -1;

      if (alreadyFollowed) {
        auth.followers.splice(index, 1);
      } else {
        auth.followers.push(userId);
      }
      auth.markModified('followers');

      await auth.save();

      return {
        user: auth.getPublicData(),
        message: `You've ${alreadyFollowed ? 'unfollowed': 'followed'} ${username}!`,
      };
    } catch (err) {
      throw err;
    }
  };
}

export default UserModule;
