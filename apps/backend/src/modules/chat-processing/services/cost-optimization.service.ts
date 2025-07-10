import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class CostOptimizationService {
  private readonly logger = new Logger(CostOptimizationService.name);

  private dailyCost = 0;
  private monthlyCost = 0;
  private dailyApiCalls = 0;
  private monthlyApiCalls = 0;

  /**
   * Track API call cost
   */
  async trackApiCall(cost: number): Promise<void> {
    this.dailyCost += cost;
    this.monthlyCost += cost;
    this.dailyApiCalls++;
    this.monthlyApiCalls++;

    this.logger.log(`API call tracked: $${cost.toFixed(4)}`);
  }

  /**
   * Check if within budget limits
   */
  async isWithinBudget(): Promise<boolean> {
    const dailyLimit = 2; // $2 per day
    const monthlyLimit = 50; // $50 per month

    return this.dailyCost <= dailyLimit && this.monthlyCost <= monthlyLimit;
  }

  /**
   * Get cost statistics
   */
  async getCostStatistics(): Promise<{
    dailyCost: number;
    monthlyCost: number;
    dailyApiCalls: number;
    monthlyApiCalls: number;
    averageCostPerCall: number;
  }> {
    const averageCostPerCall =
      this.dailyApiCalls > 0 ? this.dailyCost / this.dailyApiCalls : 0;

    return {
      dailyCost: this.dailyCost,
      monthlyCost: this.monthlyCost,
      dailyApiCalls: this.dailyApiCalls,
      monthlyApiCalls: this.monthlyApiCalls,
      averageCostPerCall,
    };
  }

  /**
   * Reset daily counters
   */
  async resetDailyCounters(): Promise<void> {
    this.dailyCost = 0;
    this.dailyApiCalls = 0;
    this.logger.log("Daily cost counters reset");
  }

  /**
   * Reset monthly counters
   */
  async resetMonthlyCounters(): Promise<void> {
    this.monthlyCost = 0;
    this.monthlyApiCalls = 0;
    this.logger.log("Monthly cost counters reset");
  }
}
