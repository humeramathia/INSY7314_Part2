const crypto = require("crypto");

const {
    findUserByEmail,
    findUserById,
    addUser
} = require("../models/userStore");

const {
    hashPassword,
    comparePassword
} = require("../utils/password");

const {
    signToken
} = require("../utils/jwt");

const register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        const existingUser = findUserByEmail(email);

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "A user with this email already exists"
            });
        }

        const hashedPassword = await hashPassword(password);

        const newUser = {
            id: crypto.randomUUID(),
            name,
            email,
            password: hashedPassword,
            role
        };

        addUser(newUser);

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = findUserByEmail(email);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const passwordMatches = await comparePassword(
            password,
            user.password
        );

        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = signToken(user);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

const getCurrentUser = (req, res) => {
    const user = findUserById(req.user.id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found"
        });
    }

    return res.status(200).json({
        success: true,
        message: "Authenticated user retrieved successfully",
        data: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    });
};

module.exports = {
    register,
    login,
    getCurrentUser
};