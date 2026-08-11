export const MOCK_PARTIES = [
  {
    id: 1,
    accountNo: "000000001",
    status: { id: 300, code: "clientStatusType.active", value: "Active" },
    active: true,
    activationDate: [2026, 1, 12],
    firstname: "Amit",
    lastname: "Kumar",
    displayName: "Amit Kumar",
    mobileNo: "+91-9876543210",
    emailAddress: "amit.kumar@example.com",
    officeId: 1,
    officeName: "Global HQ"
  },
  {
    id: 2,
    accountNo: "000000002",
    status: { id: 100, code: "clientStatusType.pending", value: "Pending" },
    active: false,
    fullname: "TechNova Solutions Pvt Ltd",
    displayName: "TechNova Solutions Pvt Ltd",
    mobileNo: "+91-8888888888",
    emailAddress: "contact@technova.example.com",
    officeId: 1,
    officeName: "Global HQ"
  }
];

export const MOCK_APPLICATIONS = [
  {
    id: 1001,
    accountNo: "000001001",
    status: { id: 100, code: "loanStatusType.submitted.and.pending.approval", value: "Submitted and pending approval" },
    clientId: 1,
    clientName: "Amit Kumar",
    loanProductId: 1,
    loanProductName: "LAS_01",
    principal: 500000,
    summary: { principalOutstanding: 500000 },
    timeline: { submittedOnDate: [2026, 7, 1] }
  }
];

export const MOCK_LOAN_ACCOUNTS = [
  {
    id: 2001,
    accountNo: "000002001",
    status: { id: 300, code: "loanStatusType.active", value: "Active" },
    clientId: 1,
    clientName: "Amit Kumar",
    loanProductId: 1,
    loanProductName: "LAS_01",
    principal: 500000,
    summary: { principalOutstanding: 450000 },
    timeline: { actualDisbursementDate: [2026, 6, 15] },
    inArrears: false
  }
];

export const MOCK_MAKER_CHECKERS = [
  {
    id: 1,
    actionName: "CREATE",
    entityName: "LOAN",
    resourceId: 1001,
    subresourceId: null,
    maker: "loan.officer@finbyx.com",
    madeOnDate: "2026-07-13T09:00:00Z",
    checker: null,
    checkedOnDate: null,
    processingResult: "PENDING",
    commandAsJson: JSON.stringify({
      productId: 1,
      principal: 500000,
      loanTermFrequency: 12,
      loanTermFrequencyType: 2,
      interestRatePerPeriod: 12.5,
      amortizationType: 1,
      interestType: 0,
      interestCalculationPeriodType: 1,
      transactionProcessingStrategyId: 1,
      expectedDisbursementDate: "2026-07-20"
    }, null, 2)
  },
  {
    id: 2,
    actionName: "UPDATE",
    entityName: "CLIENT",
    resourceId: 231,
    subresourceId: null,
    maker: "kyc.agent@finbyx.com",
    madeOnDate: "2026-07-13T09:30:00Z",
    checker: "branch.manager@finbyx.com",
    checkedOnDate: "2026-07-13T10:15:00Z",
    processingResult: "APPROVED",
    commandAsJson: JSON.stringify({
      status: "ACTIVE",
      activationDate: "2026-07-13"
    }, null, 2)
  },
  {
    id: 3,
    actionName: "WAIVE",
    entityName: "LOANCHARGE",
    resourceId: 450,
    subresourceId: null,
    maker: "collections.agent@finbyx.com",
    madeOnDate: "2026-07-12T14:20:00Z",
    checker: "tenant.admin@finbyx.com",
    checkedOnDate: "2026-07-13T08:00:00Z",
    processingResult: "REJECTED",
    commandAsJson: JSON.stringify({
      amount: 1500,
      note: "Customer promised to pay tomorrow"
    }, null, 2)
  }
];

export function getMockResponse(path: string, method: string) {
  if (method === "GET") {
    if (path.includes("/parties")) return MOCK_PARTIES;
    if (path.includes("/applications")) return MOCK_APPLICATIONS;
    if (path.includes("/loan-accounts")) return MOCK_LOAN_ACCOUNTS;
    if (path.includes("/makercheckers")) return MOCK_MAKER_CHECKERS;
  }
  
  if (method === "POST") {
    return { success: true, message: "Mock write successful", timestamp: new Date().toISOString() };
  }

  return { error: "Not found in mock" };
}
