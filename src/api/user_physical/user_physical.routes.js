const express = require('express');
const yup = require('yup');
const apiError = require('../../lib/apiError');

const UserPhysical = require('./user_physical.model');
const authMiddlewares = require('../auth/auth.middlewares');
const { orWhereNotExists } = require('../../db');
const router = express.Router();
router.use(authMiddlewares.checkUserHasToken);

const schema = yup.object().shape({
  id: yup.number().required(),
});

router.get('/:id', authMiddlewares.isLoggedIn, async (req, res, next) => {
  const { id } = req.params;
  try {
    await schema.validate({ id }, { abortEarly: false });
    if (req.user.id != parseInt(id, 10)) {
      const err = await apiError('E3200');
      res.status(403);
      throw err;
    }
    const users = await UserPhysical.query()
      .select(
        'id',
        't_user_id',
        'weight_kg',
        'height_cm',
        'handed',
        'age',
        'sex'
      )
      .where('id', id)
      .where('t_user_id', req.user.id)
      .where('deleted_at', null);
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// router.post('/', async (req, res) => {
//   console.log('전달받은 바디');
//   console.lop(req.body);

//   try {
//     const user = await User.query.insert(req.body);
//   } catch (error) {}
// });

module.exports = router;
