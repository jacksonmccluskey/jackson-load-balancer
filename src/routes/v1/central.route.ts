// Copyright © 2024 Jackson McCluskey
// GitHub @jacksonmccluskey [https://github.com/jacksonmccluskey]

import express from 'express';
import centralController from '../../controllers/central.controller';

export const router = express.Router();

export type RequestMethod = 'POST' | 'GET' | 'PUT' | 'DELETE';

router.all('*', centralController);

export default router;
