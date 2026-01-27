import express, { Request, Response } from 'express';
import passport from 'passport';
import { generateToken } from '../auth/jwt';
import { authenticateJWT, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Check if OAuth is enabled
router.get('/config', (req: Request, res: Response) => {
  const oauthEnabled = !!(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_CALLBACK_URL
  );
  res.json({ oauthEnabled });
});

// Google OAuth login
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

// Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req: Request, res: Response) => {
    const user = req.user as any;

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    // Redirect to frontend with token
    // Frontend will extract token from URL and store in localStorage
    res.redirect(`/?token=${token}`);
  }
);

// Get current user info
router.get('/me', authenticateJWT, (req: AuthRequest, res: Response) => {
  res.json({ user: req.user });
});

// Logout (client-side only, just for consistency)
router.post('/logout', (req: Request, res: Response) => {
  res.json({ success: true });
});

export default router;
