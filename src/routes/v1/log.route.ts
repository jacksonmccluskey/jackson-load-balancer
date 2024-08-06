// Copyright © 2024 Jackson McCluskey
// GitHub @jacksonmccluskey [https://github.com/jacksonmccluskey]

import express from 'express';
import logController from '../../controllers/log.controller';
import validate from '../../middlewares/validate';
import logValidation from '../../validations/log.validation';

const router = express.Router();

router
	.route('/')
	.post(validate(logValidation.writeLog), logController.writeLog)
	.get(validate(logValidation.getLogs), logController.getLogs);

export default router;
