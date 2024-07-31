import express from 'express';
import centralController from '../../controllers/central.controller';

export const router = express.Router();

export type RequestMethod = 'POST' | 'GET' | 'PUT' | 'DELETE';

router.all('*', centralController);

export default router;

/**
 * @swagger
 * tags:
 *   name: Central
 *   description: Load Balanced APIs
 */

/**
 * @swagger
 * /:
 *   post:
 *     summary: Call Any POST Request With Any Body
 *     tags: [Central]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               aaa: AAA
 *               bbb: BBB
 *               ccc: CCC
 *     responses:
 *       "200":
 *         description: Posted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
