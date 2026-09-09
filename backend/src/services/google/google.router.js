import { Router } from 'express'

import {
  iniciarGoogleOAuth,
  googleOAuthCallback,
} from './google.controller.js'

const router = Router()

// Inicia la autorización de Google
router.get('/auth/google', iniciarGoogleOAuth)

// Google devuelve aquí el código de autorización
router.get('/auth/google/callback', googleOAuthCallback)

export default router