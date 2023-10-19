import { Request, Response } from 'express';
import { DispenserService } from '../service/dispenser-service';

class DispenserController {

  private service: DispenserService;

  constructor() {
    this.service = new DispenserService();
  }

  /**
   * Create a new dispenser with the specified flow volume.
   *
   * @param req - Express request object with a flow_volume in the request body.
   * @param res - Express response object.
   * @returns JSON response with the created dispenser or an error response.
   */
  async createDispenser(req: Request, res: Response) {
    try {
      const flowVolume: number = parseFloat(req.body.flow_volume);

      if (isNaN(flowVolume)) {
        return res.status(400).json({ error: 'Invalid flow_volume. It must be a number' });
      }
      const response = await this.service.createDispenser(flowVolume);

      return res.status(200).json(response);

    } catch (error) {
      return res.status(500).json({ error: "Unexpected API error" });
    }
  }

  /**
   * Update the status of a dispenser with the specified ID.
   *
   * @param req - Express request object with the dispenser ID, status, and updated_at in the request body.
   * @param res - Express response object.
   * @returns JSON response indicating the status update or an error response.
   */
  async updateStatus(req: Request, res: Response) {
    try {
      const id: string | undefined = req.query.id as string;

      // DISCLAIMER: IMPLEMENTATION DECISION EXPLAINED HERE
      // API supports updated_at in the request body. But if no date is provided, API will take the current date
      // In terms of performance, this is better. It ables you to calculate the amount spent IN REAL TIME
      const updatedAt: string = req.body.updated_at || new Date().toISOString();
      const status: string = req.body.status;

      if (status !== "open" && status !== "close") {
        return res.status(400).json({ error: 'Invalid status. It must be open or close' });
      }

      const dispenser = await this.service.getDispenserById(id);

      if (id === undefined || dispenser === null) {
        return res.status(404).json({ error: 'Requested dispenser does not exist' });
      }

      if (status === dispenser.status) {
        return res.status(409).json({ error: 'Dispenser is already opened/closed' });
      }

      await this.service.updateStatus(status, updatedAt, id);

      return res.status(202).json({ message: "Status of the tap changed correctly" });

    } catch (error) {
      return res.status(500).json({ error: "Unexpected API error" });
    }
  }

  /**
   * Get the total amount of money spent on a dispenser based on its usage records.
   *
   * @param req - Express request object with the dispenser ID as a query parameter.
   * @param res - Express response object.
   * @returns JSON response with the total amount spent or an error response.
   */
  async getMoneySpent(req: Request, res: Response) {
    try {
      const id: string | undefined = req.query.id as string;

      const dispenser = await this.service.getDispenserById(id);
      if (dispenser === null) {
        return res.status(404).json({ error: 'Requested dispenser does not exist' });
      }
      const response = await this.service.getMoneySpent(id);

      return res.status(200).json(response);
    }
    catch (error) {
      return res.status(500).json({ error: "Unexpected API error" });
    }
  }

}

export { DispenserController };
