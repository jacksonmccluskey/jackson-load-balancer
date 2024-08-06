// Copyright © 2024 Jackson McCluskey
// GitHub @jacksonmccluskey [https://github.com/jacksonmccluskey]

import express from 'express';
import emailController from '../../controllers/email.controller';
import validate from '../../middlewares/validate';
import emailValidation from '../../validations/email.validation';

const router = express.Router();

router
	.route('/')
	.post(validate(emailValidation.sendEmail), emailController.sendEmail);

export default router;
