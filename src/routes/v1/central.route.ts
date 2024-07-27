import express, { Request, Response } from 'express';

export const router = express.Router();

const centralCallback = (req: Request, res: Response) => {
	const requestBody = req.body;
};

router.post('/', centralCallback);
router.get('/', centralCallback);
router.put('/', centralCallback);
router.delete('/', centralCallback);

export default router;
