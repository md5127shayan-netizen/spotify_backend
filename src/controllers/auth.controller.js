const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

async function registerUser(req, res) {
    try {
        const { username, email, password, role = 'user' } = req.body;

        // Check if user already exists
        const isUserAlreadyExist = await userModel.findOne({
            $or: [{ username }, { email }]
        });

        if (isUserAlreadyExist) {
            return res.status(400).json({
                message: 'Username or email already exists'
            });

    
        }

        // Hash password
        const hash = await bcrypt.hash(password, 10);

        // Create new user
        const user = new userModel({
            username,
            email,
            password: hash,
            role
        });

        await user.save();

        // Generate token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

async function loginUser(req, res) {
    try {
        const { username, email, password } = req.body;

        const user = await userModel.findOne({
            $or: [{ email }, { username }]
        });

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(400).json({
                message: 'Invalid credentials'
            });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET
        );

        res.cookie('token', token, {
            httpOnly: true
        });

        res.status(200).json({
            message: 'User logged in successfully',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}
    

async function logoutUser(req, res) {
    res.clearCookie('token');
    res.status(200).json({
        message: 'User logged out successfully'
    });
}

module.exports = {
    registerUser,
    loginUser,
    logoutUser
};