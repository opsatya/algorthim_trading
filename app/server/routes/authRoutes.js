// authRoute.js (in your server/routes folder)
import express from 'express';
const router = express.Router();
import User from '../models/User.js';
import OTP from '../models/OTP.js';
import jwt from 'jsonwebtoken';
import { generateOTP } from '../utils/generateOTP.js';
import { sendOTPEmail } from '../services/emailService.js';
import { authenticate } from '../middlewares/auth.js';

// SignUp
router.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: existingUser.email === email ? 'Email already in use' : 'Username already taken'
            });
        }

        const user = new User({ username, email, password });
        await user.save();

        const otp = generateOTP();

        await new OTP({ userId: user._id, email, otp }).save();

        const emailSent = await sendOTPEmail(email, otp);

        if (!emailSent) {
            return res.status(500).json({ success: false, message: 'Failed to send OTP email' });
        }

        return res.status(201).json({
            success: true,
            message: 'User registered successfully. Please verify your email.',
            userId: user._id
        });
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ success: false, message: 'Registration failed' });
    }
});

router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        
        // Add logging to debug
        console.log(`Verifying: Email=${email}, OTP=${otp}`);
        
        // Convert OTP to string to ensure consistent comparison
        const otpString = otp.toString().trim();
        
        // First find by email to check if any OTP exists for this user
        const otpRecord = await OTP.findOne({ email });
        
        if (!otpRecord) {
            console.log(`No OTP found for email: ${email}`);
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }
        
        console.log(`Found OTP record: ${otpRecord.otp}`);
        
        // Explicitly compare the OTPs
        if (otpRecord.otp !== otpString) {
            console.log(`OTP mismatch: Expected=${otpRecord.otp}, Received=${otpString}`);
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }
        
        // Continue with the rest of your code for successful verification
        const user = await User.findByIdAndUpdate(otpRecord.userId, { isVerified: true }, { new: true });
        
        await OTP.deleteOne({ _id: otpRecord._id });
        
        // Generate token for auto-login after verification
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production'
        });
        
        return res.status(200).json({ 
            success: true, 
            message: 'Email verified successfully',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('OTP verification error:', error);
        return res.status(500).json({ success: false, message: 'Verification failed' });
    }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await OTP.deleteMany({ userId: user._id });

        const otp = generateOTP();

        await new OTP({ userId: user._id, email, otp }).save();

        const emailSent = await sendOTPEmail(email, otp);

        if (!emailSent) {
            return res.status(500).json({ success: false, message: 'Failed to send OTP email' });
        }

        return res.status(200).json({ success: true, message: 'OTP resent successfully' });
    } catch (error) {
        console.error('Resend OTP error:', error);
        return res.status(500).json({ success: false, message: 'Failed to resend OTP' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email and password are required' 
            });
        }
        
        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }

        if (!user.isVerified) {
            return res.status(403).json({
                success: false,
                message: 'Email not verified',
                requireVerification: true,
                email: user.email
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Calculate expiry date (7 days from now)
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 7);

        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production'
        });

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            expiresAt: expiryDate.getTime(),
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Get current user
router.get('/me', authenticate, (req, res) => {
    return res.status(200).json({
        success: true,
        user: {
            id: req.user._id,
            username: req.user.username,
            email: req.user.email
        }
    });
});

// Logout
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    return res.status(200).json({ success: true, message: 'Logout successful' });
});

export default router;