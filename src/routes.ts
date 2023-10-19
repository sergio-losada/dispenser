import express from 'express';
import { DispenserController } from './controller/dispenser-controller';
import swaggerUi from 'swagger-ui-express';
const specs = require('../swagger-options');

const router = express.Router();
const controller = new DispenserController();

/**
 * @swagger
 * /dispenser:
 *   post:
 *     summary: Create a new dispenser with the specified flow volume
 *     parameters:
 *       - in: body
 *         name: body
 *         description: Request body with flow_volume
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             flow_volume:
 *               type: number
 *     responses:
 *       200:
 *         description: Dispenser created successfully
 *       400:
 *         description: Invalid flow_volume provided
 *       500:
 *         description: Unexpected API error
 */
router.post('/', (req, res) => controller.createDispenser(req, res));

/**
 * @swagger
 * /dispenser:
 *   put:
 *     summary: Update the status of a dispenser
 *     parameters:
 *       - in: query
 *         name: id
 *         description: Dispenser ID
 *         required: true
 *         schema:
 *           type: string
 *       - in: body
 *         name: body
 *         description: Request body with dispenser ID, status, and updated_at
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *             updated_at:
 *               type: string
 *     responses:
 *       202:
 *         description: Status of the tap changed correctly
 *       400:
 *         description: Invalid status. It must be open or close
 *       404:
 *         description: Requested dispenser does not exist
 *       409:
 *         description: Dispenser is already opened/closed
 *       500:
 *         description: Unexpected API error
 */
router.put('/', (req, res) => controller.updateStatus(req, res));

/**
 * @swagger
 * /dispenser:
 *   get:
 *     summary: Get the total amount of money spent on a dispenser
 *     parameters:
 *       - in: query
 *         name: id
 *         description: Dispenser ID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Total amount spent by the dispenser
 *       404:
 *         description: Requested dispenser does not exis
 *       500:
 *         description: Unexpected API error
 */
router.get('/', (req, res) => controller.getMoneySpent(req, res));

router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

export = router;