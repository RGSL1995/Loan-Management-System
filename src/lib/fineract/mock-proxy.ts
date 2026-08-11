import { ProxyResponse, FineractProxyOptions } from "./types";
import {
  MOCK_CLIENTS,
  MOCK_LOAN_PRODUCTS,
  MOCK_LOANS,
  MOCK_LOAN_SCHEDULE,
  MOCK_SAVINGS_ACCOUNTS,
  MOCK_GL_ACCOUNTS,
  MOCK_MAKER_CHECKERS,
} from "./mocks/data";

function delay(ms: number = 100) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function mockProxyToFineract<T = unknown>(
  path: string,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  body?: unknown,
  options?: FineractProxyOptions
): Promise<ProxyResponse<T>> {
  await delay();

  const pathLower = path.toLowerCase();

  try {
    // Clients endpoints
    if (pathLower.startsWith("clients") && method === "GET") {
      if (pathLower.match(/^clients\/\d+$/)) {
        const id = parseInt(pathLower.split("/")[1]);
        const client = MOCK_CLIENTS.find((c) => c.id === id);
        if (client) {
          return { data: client as T, status: 200, headers: {} };
        }
        return {
          error: { defaultUserMessage: "Client not found" } as any,
          status: 404,
          headers: {},
        };
      }
      return {
        data: { pageItems: MOCK_CLIENTS, totalFilteredRecords: MOCK_CLIENTS.length } as T,
        status: 200,
        headers: {},
      };
    }

    if (pathLower.startsWith("clients") && method === "POST") {
      const newClient = {
        id: Math.max(...MOCK_CLIENTS.map((c) => c.id)) + 1,
        ...(body as Record<string, unknown>),
        status: "PENDING",
      };
      
      MOCK_CLIENTS.unshift(newClient as any);
      return { data: newClient as T, status: 200, headers: {} };
    }

    // Loan products endpoints
    if (pathLower.startsWith("loanproducts") && method === "GET") {
      if (pathLower.match(/^loanproducts\/\d+$/)) {
        const id = parseInt(pathLower.split("/")[1]);
        const product = MOCK_LOAN_PRODUCTS.find((p) => p.id === id);
        if (product) {
          return { data: product as T, status: 200, headers: {} };
        }
        return {
          error: { defaultUserMessage: "Loan product not found" } as any,
          status: 404,
          headers: {},
        };
      }
      return {
        data: { pageItems: MOCK_LOAN_PRODUCTS } as T,
        status: 200,
        headers: {},
      };
    }

    // Loans endpoints
    if (pathLower.startsWith("loans") && method === "GET") {
      if (pathLower.includes("?associations=repaymentschedule")) {
        const loanId = parseInt(pathLower.split("/")[1]);
        const loan = MOCK_LOANS.find((l) => l.id === loanId);
        if (loan) {
          return {
            data: { ...loan, repaymentSchedule: MOCK_LOAN_SCHEDULE } as T,
            status: 200,
            headers: {},
          };
        }
      }

      if (pathLower.match(/^loans\/\d+$/)) {
        const id = parseInt(pathLower.split("/")[1]);
        const loan = MOCK_LOANS.find((l) => l.id === id);
        if (loan) {
          return { data: loan as T, status: 200, headers: {} };
        }
        return {
          error: { defaultUserMessage: "Loan not found" } as any,
          status: 404,
          headers: {},
        };
      }

      return {
        data: { pageItems: MOCK_LOANS, totalFilteredRecords: MOCK_LOANS.length } as T,
        status: 200,
        headers: {},
      };
    }

    if (pathLower.startsWith("loans") && method === "POST") {
      if (pathLower.includes("?command=approve")) {
        const loanId = parseInt(pathLower.split("/")[1]);
        const loan = MOCK_LOANS.find((l) => l.id === loanId);
        if (loan) {
          loan.status = "APPROVED";
          loan.approvedOnDate = new Date().toISOString().split("T")[0];
          return { data: { loanId } as T, status: 200, headers: {} };
        }
      }

      if (pathLower.includes("?command=disburse")) {
        const loanId = parseInt(pathLower.split("/")[1]);
        const loan = MOCK_LOANS.find((l) => l.id === loanId);
        if (loan) {
          loan.status = "ACTIVE";
          loan.disbursed = true;
          loan.actualDisbursementDate = new Date().toISOString().split("T")[0];
          return { data: { loanId } as T, status: 200, headers: {} };
        }
      }

      if (pathLower.includes("?command=repayment")) {
        return { data: { resourceId: Math.random() } as T, status: 200, headers: {} };
      }

      const bodyData = body as Record<string, any> || {};
      const newLoan = {
        id: Math.max(...MOCK_LOANS.map((l) => l.id)) + 1,
        accountNo: `LN-${Math.floor(Math.random() * 90000) + 10000}`,
        clientId: bodyData.clientId || 1,
        loanProductName: bodyData.loanProductName || "Consumer Loan",
        principal: bodyData.principal || 50000,
        ...bodyData,
        status: "SUBMITTED_AND_PENDING_APPROVAL",
        submittedOnDate: new Date().toISOString().split('T')[0],
      };
      
      MOCK_LOANS.unshift(newLoan as any);
      return { data: newLoan as T, status: 200, headers: {} };
    }

    // Maker-Checkers endpoints
    if (pathLower.startsWith("makercheckers")) {
      if (method === "GET") {
        return { data: MOCK_MAKER_CHECKERS as T, status: 200, headers: {} };
      }
      
      if (method === "POST" && pathLower.includes("?command=")) {
        const id = parseInt(pathLower.split("/")[1]);
        const task = MOCK_MAKER_CHECKERS.find((t) => t.id === id);
        
        if (task) {
          if (pathLower.includes("command=approve")) {
            task.processingResult = "APPROVED";
            task.checker = "credit.manager@finbyx.com"; // Mock checker
            task.checkedOnDate = new Date().toISOString();
          } else if (pathLower.includes("command=reject")) {
            task.processingResult = "REJECTED";
            task.checker = "credit.manager@finbyx.com"; // Mock checker
            task.checkedOnDate = new Date().toISOString();
          }
          return { data: { resourceId: task.id } as T, status: 200, headers: {} };
        }
      }
    }

    // Savings accounts endpoints
    if (pathLower.startsWith("savingsaccounts") && method === "GET") {
      return {
        data: {
          pageItems: MOCK_SAVINGS_ACCOUNTS,
          totalFilteredRecords: MOCK_SAVINGS_ACCOUNTS.length,
        } as T,
        status: 200,
        headers: {},
      };
    }

    // GL accounts endpoints
    if (pathLower.startsWith("glaccounts") && method === "GET") {
      return {
        data: { glAccountData: MOCK_GL_ACCOUNTS } as T,
        status: 200,
        headers: {},
      };
    }

    // Journal entries
    if (pathLower.startsWith("journalentries") && method === "POST") {
      return {
        data: { resourceId: Math.random() } as T,
        status: 200,
        headers: {},
      };
    }

    return {
      error: { defaultUserMessage: "Endpoint not implemented in mock" } as any,
      status: 501,
      headers: {},
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return {
      error: { defaultUserMessage: errorMessage } as any,
      status: 500,
      headers: {},
    };
  }
}
