const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const {
  User,
  validateUser,
  validateUserLogins,
} = require("../models/user_model");
const {cloudinary, uploadImage} = require("../utils/cloudinary");
const { sendPushNotification } = require("./push_notification_controller");

//test for push notification
const initiatePushNotification = asyncHandler(async (req, res) =>{
  const {data, token,notification} = req.body
  const payload = {
    notification,
    data,
    token,
  }
   sendPushNotification(payload);
   res.status(200).json({message: 'Notification send succefully'});
  
})


// @desc Get all users
// @route GET /api/users
// @access Private
const getUsers = asyncHandler(async (req, res) => {
  if (!req.params.id) {
    const page = req.query.page;
    const limit = req.query.size;
    const startIndex = (page - 1) * limit;
    // const endIndex = page * limit;
    const users = await User.find({
      $or: [
        { first_name: { $regex: new RegExp(`^${req.query.query}.*`, "i") } },
        { first_name: { $regex: req.query.query ? req.query.query : "" } },
        { last_name: { $regex: req.query.query ? req.query.query : "" } },
        { email: { $regex: req.query.query ? req.query.query : "" } },
      ],
    })
      .select("-password")
      .limit(limit)
      .skip(startIndex);

    res.status(200).json(users);
  } else {
    const user = await User.findById(req.params.id).select("-password");
    if (user) {
      res.status(200).json(user);
    } else {
      throw new Error("User not found");
    }
  }
});

// @desc Register user
// @route POST /api/users/auth/signup
// @access Private
const addUser = asyncHandler(async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) {
    res.status(400).json({ message: error.details[0].message });
  } else {
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json({ message: "User already exist!" });
    } else {
      // hashing password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      const base64String = req.body.image;
      let image = '';
      if(base64String){
         image = await uploadImage(base64String);
      }
   
      user = new User({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        password: hashedPassword,
        phone: req.body.phone,
        role: req.body.role,
        address: req.body.address,
        job_description: req.body.job_description,
        company: req.body.company,
        image: image,
        gender: req.body.gender,
        skills: req.body.skills,
        job_title: req.body.job_title,
        status: req.body.status,
        is_agent: req.body.is_agent,
      });

      await user.save();
      if (user) {
        console.log(user.company);
        res.status(201).json({
          _id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          index_number: user.index_number,
          phone: user.phone,
          role: user.role,
          address: user.address,
          job_description: user.job_description,
          company: user.company,
          gender: user.gender,
          image: user.image,
          job_title: user.job_title,
          is_agent: user.is_agent,
          status: user.status,
          token: generateToken(user._id),
        });
      } else {
        res.status(400);
        throw new Error("Invalid user");
      }
    }
  }
});

// @desc Authenticate a user
// @route GET /api/users/login
// @access Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password,device_token } = req.body;

  const { error } = validateUserLogins(req.body);
  if (error) {
    res.status(400).json({ message: error.details[0].message });
  } else {
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = generateToken(user._id);

      let oldTokens = user.tokens || [];

      if (oldTokens.length) {
        oldTokens = oldTokens.filter((token) => {
          const timeDiff = (Date.now() - parseInt(token.signedAt)) / 1000;
          if (timeDiff < 86400) {
            return token;
          }
        });
      }

      await User.findByIdAndUpdate(user._id, {
        device_token : device_token,
        tokens: [...oldTokens, { token, signedAt: Date.now().toString() }],
      });
      res.set("access_token", token);

      const userData = {
        _id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        index_number: user.index_number,
        phone: user.phone,
        image: user.image,
        address: user.address,
        job_description: user.job_description,
        company: user.company,
        status: user.status,
        is_agent: user.is_agent,
      };
      res.status(200).json({
        user_token_validation: userData,
      });
    } else {
      res.status(400);
      throw new Error("Invalid credentials");
    }
  }
});

// @desc Get user data
// @route GET /api/users/user
// @access Private
const getUser = asyncHandler(async (req, res) => {
  const {
    _id,
    first_name,
    last_name,
    email,
    image,
    index_number,
    phone,
    role,
    gender,
    address,
    company,
    job_description,
    job_title,
    is_agent,
    status,
  } = await User.findById(req.user.id);

  res.status(200).json({
    id: _id,
    first_name: first_name,
    last_name: last_name,
    email: email,
    image: image,
    gender: gender,
    index_number: index_number,
    phone: phone,
    role: role,
    address: address,
    job_description: job_description,
    job_title: job_title,
    company: company,
    status: status,
    is_agent: is_agent,
  });
});

// @desc Update user
// @route PUT /api/users/:id
// @access Private
const updateUser = asyncHandler(async (req, res) => {
  let user = undefined;
  try {
    user = await User.findById(req.params.id);
  } catch (error) {
    console.log(error);
  }
  if (user == undefined) {
    res.status(400);
    throw new Error("User not found");
  } else {
    let body;
  
    let imageRes = null;
   
    if (req.body.image) {
      const base64String = req.body.image;
      //upload image to cloudinary 
      const image = await uploadImage(base64String);
      body = {
        ...req.body,
        image: image,
      };
    } else {
      body = {
        ...req.body,
      };
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, body, {
      new: true,
    });

    res.status(200).json({
      _id: updatedUser.id,
      first_name: updatedUser.first_name,
      last_name: updatedUser.last_name,
      image: updatedUser.image,
      email: updatedUser.email,
      index_number: updatedUser.index_number,
      phone: updatedUser.phone,
      role: updatedUser.role,
      address: updatedUser.address,
      job_title: updatedUser.job_title,
      job_description: updatedUser.job_description,
      company: updatedUser.company,
      status: updatedUser.status,
      is_agent: updatedUser.is_agent,
    });
  }
});

// @desc Delete user
// @route DELETE /api/users/:id
// @access Private
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(400);
    throw new Error("User not found");
  }
  await user.remove();
  res.status(200).json({ id: req.params.id });
});

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRETE, {
    expiresIn: "10d",
  });
};

// @desc log user out
// @route DELETE /api/users/auth/logout
// @access Private
const logout = asyncHandler(async (req, res) => {
  if (req.headers && req.headers.authorization) {
    let token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Authorization failed" });
    } else {
      const tokens = req.user.tokens;
      const newTokens = tokens.filter((t) => {
        t.token != token;
      });

      await User.findByIdAndUpdate(req.user._id, {
         device_token: null,
         tokens: newTokens });

      res.status(200).json({ message: "User logged out successfully" });
    }
  }
});

//@desc get all agents
//@route GET api/users/agents
//@access PRIVATE
const getAgents = asyncHandler(async (req, res) => {
  const page = req.query.page;
  const limit = req.query.size;
  const query = req.query.query;
  const startIndex = (page - 1) * limit;

  let searchQuery = {};
  if (query) {
    searchQuery = {
      is_agent: true,
      $or: [
        { first_name: { $regex: new RegExp(`^${req.query.query}.*`, "i") } },
        { last_name: { $regex: new RegExp(`^${req.query.query}.*`, "i") } },
        {
          job_description: { $regex: new RegExp(`^${req.query.query}.*`, "i") },
        },
        { job_title: { $regex: new RegExp(`^${req.query.query}.*`, "i") } },
        { skills: { $in: [req.query.query] } },
      ],
    };
  } else {
    searchQuery = {
      is_agent: true,
    };
  }
  let totalCount = 0;
  const agents = await User.find(searchQuery)
    .select("-password")
    .limit(limit)
    .skip(startIndex);

  if (agents) {
    totalCount = agents.length;
    res.set("total-count", totalCount);
    res.status(200).json(agents);
  } else {
    res.status(400);
    throw new Error("Failed to fetch agents");
  }
});
module.exports = {
  getAgents,
  getUsers,
  addUser,
  updateUser,
  deleteUser,
  loginUser,
  getUser,
  logout,
  initiatePushNotification
};
