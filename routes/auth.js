var express = require('express');
const auth = require('../middleware/auth');
const UserModel = require('../models/schema/auth');
const multer = require('multer');
const sharp = require('sharp');
var router = express.Router();

/**
 * GET 
 * Fetch user lists 
 * req.user data come from auth middleware
 */
router.get('/profile', auth, async (req, res) => {

  try {
    res.status(200).send(req.user);
  } catch (err) {
    res.status(400).send(err);
  }

});

/**
 * POST
 * Create users through signup
 */
router.post('/signup', async (req, res) => {
  try {
    const user = new UserModel(req.body);
    await user.save();
    res.status(201).send(user);
  } catch (e) {
    let err;
    if(e.code == 11000)
      err = 'Email already exist';
    else
      err = e._message
    res.status(400).send({message: err});
  }

});


/* Patch update the users informations*/
router.patch('/profile', auth, async (req, res) => {

  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'phone', 'password', 'age'];
  /**
   * every() method tests whether all elements in the array pass the test implemented by the provided function.
   *  It returns a Boolean value.
   */
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidOperation) // check for only existing properties will update
    return res.status(400).json({ error: 'Invalid updates!' });

  try {
    updates.forEach((update) => req.user[update] = req.body[update]);
    await req.user.save();

    res.status(202).send(req.user);

  } catch (err) {
    res.status(400).send(err);
  }
});


router.delete('/profile', auth, async (req, res) => {
  try {
    // save() is used for save the data to mongoDB 
    // delete() is used for delete the data from mongoDB that functionality provided bt mongoose
    await req.user.remove();

    res.send(req.user);
  } catch (e) {
    res.send(500).send();
  }
});


const upload = multer({
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpeg|jpg|png)$/)) {
      return cb(new Error('Please upload an image'));
    }

    cb(undefined, true);
  }
});

/**
 * POST
 * upload user avatar in Database instead of node-server because
 * when we re-deployed my patch on server like heroku all the user images is gone losed
 */

router.post('/profile/avatar', auth, upload.single('avatar'), async (req, res) => {
  // sharp library help to set resolution and convert type
  const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
  req.user.avatar = buffer;
  // req.user.avatar = req.file.buffer; // use when we donot use sharp library then comment upper two line
  await req.user.save();
  res.send()
}, (error, req, res, next) => {
  /*  * using for send custom error message in json format
      * because when we use middleware is always through error in html
        to prevent we use this arrow function */
  res.status(400).send({ error: error.message });
});

/**
 * GET
 * Fetch User avatar based on particular Id
 * Why not use req.user.avatar and auth instead of :id params and UserModel.findById ?
 * Because avatar Buffer size is big we donot want to use casaully used when we required
 */


router.get('/profile/:id/avatar', async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);

    if (!user || !user.avatar) {
      throw new Error()
    }

    res.set('Content-Type', 'image/png');
    res.send(user.avatar);
  } catch (e) {
    res.status(400).send();
  }
});

/**
 * DELETE
 * Remove User avatar images from database
 */


router.delete('/profile/avatar', auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save()
  res.send()
});


/**
 * GET
 * login through some credentials
 */
router.post('/login', async (req, res) => {
  try {
    const user = await UserModel.findByCredentials(req.body.email, req.body.password);

    const token = await user.generateAuthToken();

    const expiresIn =  3600;

    res.send({ user, token, expiresIn });
  } catch (e) {
    res.status(400).send({message: e});
  }
});

/**
 * GET
 * User logout from same devices
 */

router.get('/logout', auth, async (req, res) => {
  try {

    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });

    await req.user.save();

    res.send();
  } catch (e) {
    res.status(500).send()
  }
});

/**
 * GET
 * User logout from all devices just like gmail or netflix
 */

router.get('/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
