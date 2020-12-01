const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');


const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: {
        type: String,
        required: [true, 'email is required'],
        unique: [true, 'email is already exist'],
        trim: true,
        lowerCase: true,
        validate(value) {
            if (!validator.isEmail(value))
                throw new Error('Email is invalid');
        }
    },
    phone: {
        type: Number,
        required: true,
        unique: true,
        validate(value) {
            var re = /^[1-9][0-9]{9}$/
            if (!re.test(value))
                throw new Error('Mobile Number should be 10 digit');
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 6,
        validate(value) {
            var re = /^((?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@#$%_]).{6,20})/
            if (!re.test(value))
                throw new Error('Min length 6, 1 capital, 1 lower and 1 symbol is required');
        }
    },
    status: {
        type: String,
        default: 'registered',
        enum: ['registered', 'verified']
    },
    role: {
        type: String,
        default: 'Account Administrator',
        enum: ['Super Admin', 'Admin', 'Account Administrator']
    },
    tokens: [{
        token: {
            type: String,
            // required: true
        }
    }
    ],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
});

/* whenever we send back the user data this function call automatically and
 delete some field from the user  because we donot want to show password and tokens etc informations*/
userSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;

    return userObject;
}

/**
 * Generate multiple tokens with same user and store to database
 * Reason:-
 * When user logout then token destroy from the same device
 * We dont want to user logout from another device just like netflix one user multiple login
  */
userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, 'Dragon'); // generate token

    user.tokens = user.tokens.concat({ token }); // add every token
    await user.save(); // save to database in form of ArrayOfObject

    return token;
}


userSchema.statics.findByCredentials = async (email, password) => {

    const user = await User.findOne({ email }); // {email} short hand syntax for {email: email}

    if (!user)
        throw new Error('Unable to login');

    if (user.status == 'registered')
        throw new Error('Account is not verified');

    const isMatch = await bcrypt.compareSync(password, user.password);

    if (!isMatch)
        throw new Error('Unable to login');


    return user;
}

//Hash the plain text password before saving
userSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password'))
        user.password = bcrypt.hashSync(user.password, 8);

    next();
})

const User = mongoose.model("User", userSchema);

module.exports = User