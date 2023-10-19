import { Dispenser, Usage } from "../model/dispenser";
import { v4 as uuidv4 } from 'uuid';
import { DispenserRepository } from "../repository/dispenser-repository";

class DispenserService {

  private repository: DispenserRepository;
  private pricePerLitre: number;

  constructor() {
    this.repository = new DispenserRepository();
    this.pricePerLitre = 12.25;
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
      
      if (lastUsage) {
        // Status: from open to close
        if (lastUsage.closed_at === null) {
          const flowVolume = dispenser.flow_volume;
          lastUsage.closed_at = updated_at;
          const newUsage = {
            opened_at: lastUsage.opened_at,
            closed_at: updated_at,
            flow_volume: flowVolume,
            total_spent: this.calculateTotalSpent(this.calculateTimeDifference(lastUsage.opened_at, new Date().toISOString()), flowVolume)
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
            // flow_volume: dispenser.flow_volume,
            // total_spent: parseFloat((this.calculateTimeDifference(updated_at, new Date().toISOString()) * dispenser.flow_volume * this.reference).toFixed(3))
          }
          dispenser.usages?.push(newUsage);
        }
      }
      // First usage: from close to open
      else {
        const newUsage = {
          opened_at: updated_at,
          closed_at: null,
          // flow_volume: dispenser.flow_volume,
          // total_spent: parseFloat((this.calculateTimeDifference(updated_at, new Date().toISOString()) * dispenser.flow_volume * this.reference).toFixed(3))
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
    const lastUsage: Usage = dispenser?.usages?.slice(-1)[0];
    if(lastUsage) {
      // Dispenser is closed
       if (lastUsage.closed_at !== null) {
        return {
          amount: this.calculateAmount(dispenser),
          usages: dispenser?.usages
        };
      }
      // Dispenser is open
      else {
        const flowVolume = dispenser?.flow_volume;
        const newUsage = {
          opened_at: lastUsage.opened_at,
          closed_at: null,
          flow_volume: flowVolume,
          total_spent: this.calculateTotalSpent(this.calculateTimeDifference(lastUsage.opened_at, new Date().toISOString()), flowVolume)
        }
        // Replace the last element with newUsage
        dispenser!.usages = [
          ...dispenser?.usages!.slice(0, -1),
          newUsage,
        ];
        return {
          amount: this.calculateAmount(dispenser),
          usages: dispenser?.usages
        };
      }
    }
    // Dispenser has no usages
    else {
      return {
        amount: this.calculateAmount(dispenser),
        usages: dispenser?.usages
      };
    }
    
  }

  private calculateTimeDifference(openedAt: string, closedAt: string): number {
    try {
      const startTime = new Date(openedAt);
      const endTime = new Date(closedAt);

      // Return time difference as a rounded number in seconds
      return parseFloat(((endTime.getTime() - startTime.getTime()) / 1000).toFixed(3));
    }
    catch (error) {
      throw new Error('Unexpected API error');
    }
  }

  private calculateAmount(dispenser: any) {
    const amount = dispenser.usages.reduce((sum: number, usage: Usage) => sum + usage.total_spent, 0);
    // Return amount as a rounded number
    return parseFloat(amount.toFixed(3));
  }

  private calculateTotalSpent(seconds: number, flowVolume: number) {
    const totalSpent = seconds * flowVolume * this.pricePerLitre;
    // Return total spent as a rounded number
    return parseFloat(totalSpent.toFixed(3));
  }

}

export { DispenserService };

