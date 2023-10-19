import { Dispenser, Usage } from "../model/dispenser";
import { v4 as uuidv4 } from 'uuid';
import { DispenserRepository } from "../repository/dispenser-repository";

class DispenserService {

  private repository: DispenserRepository;
  private reference: number;

  constructor() {
    this.repository = new DispenserRepository();
    this.reference = 12.25;
  }

  async createDispenser(flowVolume: number) {
    const dispenser = new Dispenser(flowVolume, uuidv4());
    return await this.repository.createDispenser(dispenser);
  }

  async updateStatus(status: "open" | "close", updated_at: string, id: string) {
    const dispenser = await this.getDispenserById(id);
    if (dispenser) {
      dispenser.status = status;

      const lastUsage = dispenser.usages?.slice(-1)[0];
      console.log(lastUsage);
      if (lastUsage) {
        // Status: from open to close
        if (lastUsage.closed_at === null) {
          lastUsage.closed_at = updated_at;
          const newUsage = {
            opened_at: lastUsage.opened_at,
            closed_at: updated_at,
            flow_volume: dispenser.flow_volume,
            total_spent: (this.calculateTimeDifference(lastUsage.opened_at, updated_at) * dispenser.flow_volume * this.reference).toFixed(3)
          }
          // Replace the last element with newUsage
          dispenser.usages = [
            ...dispenser.usages!.slice(0, -1),
            newUsage,
          ];
        }
        // Status: from close to open
        else {
          const newUsage = {
            opened_at: updated_at,
            closed_at: null,
            flow_volume: dispenser.flow_volume,
            total_spent: (this.calculateTimeDifference(updated_at, new Date().toISOString()) * dispenser.flow_volume * this.reference).toFixed(3)
          }
          dispenser.usages?.push(newUsage);
        }
      }
      // First usage: from close to open
      else {
        const newUsage = {
          opened_at: updated_at,
          closed_at: null,
          flow_volume: dispenser.flow_volume,
          total_spent: 0.0
        }
        dispenser.usages?.push(newUsage);
      }

      await this.repository.updateStatus(dispenser);
    }
    else {
      throw new Error('Requested dispenser does not exist');
    }
  }

  async getDispenserById(id: string) {
    const dispenser = await this.repository.getDispenserById(id);

    if (dispenser) {
      return dispenser;
    }
    else {
      return null;
    }
  }

  async getMoneySpent(id: string) {
    const dispenser = await this.repository.getDispenserById(id);
    return {
      amount: dispenser?.usages.reduce((sum: number, usage: Usage) => sum + usage.total_spent, 0),
      usages: dispenser?.usages
    };
  }

  async getAll() {
    return await this.repository.find();
  }

  private calculateTimeDifference(openedAt: string, closedAt: string): number {
    try {
      const startTime = new Date(openedAt);
      const endTime = new Date(closedAt);

      return (endTime.getTime() - startTime.getTime()) / 1000;
    }
    catch (error) {
      throw new Error('Unexpected API error');
    }
  }

}

export { DispenserService };

