export type BusinessRuleViolation = {
  id: string;
  ruleName: string;
  message: string;
};

export type ApplicationContext = {
  requestedAmount: number;
  eligibleAmount: number;
  foir: number;
  productFoirCap: number;
  bureauScore: number;
  minBureauScore: number;
};

export type ServicingContext = {
  dpd: number;
  marginShortfall: number;
};

export class BusinessRulesEngine {
  
  /**
   * BR-001: Requested amount <= eligible amount (LTV/DP)
   */
  static validateLoanAmount(ctx: ApplicationContext): BusinessRuleViolation | null {
    if (ctx.requestedAmount > ctx.eligibleAmount) {
      return {
        id: "BR-001",
        ruleName: "Requested amount ≤ eligible amount",
        message: `Requested limit (₹${ctx.requestedAmount}) exceeds eligible drawing power (₹${ctx.eligibleAmount}).`
      };
    }
    return null;
  }

  /**
   * BR-002: FOIR <= product cap
   */
  static validateFOIR(ctx: ApplicationContext): BusinessRuleViolation | null {
    if (ctx.foir > ctx.productFoirCap) {
      return {
        id: "BR-002",
        ruleName: "FOIR ≤ product cap",
        message: `Applicant FOIR (${ctx.foir}%) exceeds the product cap (${ctx.productFoirCap}%).`
      };
    }
    return null;
  }

  /**
   * BR-003: Bureau score >= minimum
   */
  static validateBureauScore(ctx: ApplicationContext): BusinessRuleViolation | null {
    if (ctx.bureauScore < ctx.minBureauScore) {
      return {
        id: "BR-003",
        ruleName: "Bureau score ≥ minimum",
        message: `Bureau score (${ctx.bureauScore}) is below the minimum threshold (${ctx.minBureauScore}). Route to deviation approver.`
      };
    }
    return null;
  }

  /**
   * BR-008: NPA at 90+ DPD
   */
  static evaluateNPA(ctx: ServicingContext): boolean {
    return ctx.dpd >= 90;
  }

  /**
   * BR-009: LAS: 50% LTV maintained
   */
  static isMarginCallTriggered(ctx: ServicingContext): boolean {
    return ctx.marginShortfall > 0;
  }

  /**
   * Run all underwriting application rules and return violations.
   */
  static runApplicationUnderwritingRules(ctx: ApplicationContext): BusinessRuleViolation[] {
    const violations: BusinessRuleViolation[] = [];
    
    const amtRule = this.validateLoanAmount(ctx);
    if (amtRule) violations.push(amtRule);

    const foirRule = this.validateFOIR(ctx);
    if (foirRule) violations.push(foirRule);

    const bureauRule = this.validateBureauScore(ctx);
    if (bureauRule) violations.push(bureauRule);

    return violations;
  }
}
