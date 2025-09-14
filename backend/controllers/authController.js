const User = require("../models/userModel.js");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

const login = async (req, resp) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return resp.status(400).json({ message: 'All fields are necessary' });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) return resp.status(401).json({ message: "Invalid email or password" });

        const isPasswordCorrect = await user.matchPassword(password);
        if (!isPasswordCorrect) return resp.status(401).json({ message: "Invalid email or password" });

        resp.status(200).json({
            message: 'Logged in Successfully',
            token: generateToken(user._id),
            user: {
                userId: user._id,
                email: user.email,
                userName: user.userName,
                profilePic: user.profilePic
            }
        })
    } catch (err) {
        resp.status(500).json({ message: "Server error during login" });
    }
};

const signup = async (req, resp) => {
    const { email, password, userName } = req.body;

    if (!email || !password || !userName) {
        return resp.status(400).json({ message: 'All fields are necessary' });
    }
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return resp.status(400).json({ message: "Email already exists, please use a diffrent one" });
        }

        const idx = Math.floor(Math.random() * 100) + 1; // generate a num between 1-100
        const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

        const user = await User.create({ email, userName, password, profilePic: randomAvatar });
        await user.save();

        if (user) {
            resp.status(201).json({
                message: 'User created successfully',
                token: generateToken(user._id),
                user: {
                    userId: user._id,
                    email: user.email,
                    userName: user.userName,
                    profilePic: user.profilePic
                },
                
                
            });
        } else {
            resp.status(400).json({ message: 'Invalid user data' });
        }
    } catch (err) {
        resp.status(500).json({ message: "Server error during signup" });
    }
};

const logout = (req, resp) => {
    resp.status(200).json({ success: true, message: "Logout successful - clear token on client side" });
};




module.exports = { login, signup, logout };