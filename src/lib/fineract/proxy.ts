import { ProxyResponse, FineractProxyOptions, FineractErrorSchema } from "./types";
import { mockProxyToFineract } from "./mock-proxy";

function isMockMode(): boolean {
  return (
    process.env.FINERACT_MOCK_MODE === "true" ||
    process.env.MOCK_FINERACT === "true" ||
    process.env.FINERACT_API_URL === "mock" ||
    !process.env.FINERACT_API_URL
  );
}

interface FineractConfig {
  apiUrl: string;
  username: string;
  password: string;
  defaultTenantId: string;
}

let fineractConfig: FineractConfig | null = null;
let authToken: string | null = null;
let tokenExpiry: number = 0;

function getFineractConfig(): FineractConfig {
  if (!fineractConfig) {
    const apiUrl = process.env.FINERACT_API_URL;
    const username = process.env.FINERACT_USERNAME;
    const password = process.env.FINERACT_PASSWORD;
    const defaultTenantId = process.env.FINERACT_TENANT_ID || "default";

    if (isMockMode()) {
      return { apiUrl: "mock", username: "mock", password: "mock", defaultTenantId };
    }

    if (!apiUrl || !username || !password) {
      throw new Error(
        "Missing Fineract configuration. Please set FINERACT_API_URL, FINERACT_USERNAME, and FINERACT_PASSWORD in .env.local or set FINERACT_MOCK_MODE=true"
      );
    }

    fineractConfig = { apiUrl, username, password, defaultTenantId };
  }

  return fineractConfig;
}

async function getAuthToken(): Promise<string> {
  const config = getFineractConfig();
  const now = Date.now();

  if (authToken && tokenExpiry > now) {
    return authToken;
  }

  const credentials = Buffer.from(`${config.username}:${config.password}`).toString("base64");
  const response = await fetch(`${config.apiUrl}/authentication`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
      "Fineract-Platform-TenantId": config.defaultTenantId,
    },
  });

  if (!response.ok) {
    throw new Error(`Fineract authentication failed: ${response.statusText}`);
  }

  const data = (await response.json()) as { base64EncodedAuthenticationKey: string };
  authToken = data.base64EncodedAuthenticationKey;
  tokenExpiry = now + 4 * 60 * 60 * 1000; // 4 hour expiry

  return authToken;
}

export async function proxyToFineract<T = unknown>(
  path: string,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  body?: unknown,
  options?: FineractProxyOptions
): Promise<ProxyResponse<T>> {
  if (isMockMode()) {
    return mockProxyToFineract<T>(path, method, body, options);
  }

  try {
    const config = getFineractConfig();
    const token = await getAuthToken();
    const tenantId = options?.tenantId || config.defaultTenantId;

    const url = new URL(`${config.apiUrl}/${path.replace(/^\//, "")}`);
    const headers: Record<string, string> = {
      Authorization: `Basic ${token}`,
      "Fineract-Platform-TenantId": tenantId,
      "Content-Type": "application/json",
      ...options?.headers,
    };

    const fetchOptions: RequestInit = {
      method,
      headers,
    };

    if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url.toString(), fetchOptions);
    const responseText = await response.text();

    let data: T | undefined;
    let error: unknown;

    if (responseText) {
      try {
        const json = JSON.parse(responseText);

        if (!response.ok) {
          try {
            error = FineractErrorSchema.parse(json);
          } catch {
            error = { defaultUserMessage: json.message || responseText };
          }
        } else {
          data = json as T;
        }
      } catch {
        if (!response.ok) {
          error = { defaultUserMessage: responseText };
        }
      }
    }

    return {
      data,
      error: error as any,
      status: response.status,
      headers: Object.fromEntries(response.headers),
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return {
      error: { defaultUserMessage: errorMessage } as any,
      status: 500,
      headers: {},
    };
  }
}

export async function getFineractClient(
  clientId: number,
  options?: FineractProxyOptions
): Promise<ProxyResponse<unknown>> {
  return proxyToFineract<unknown>(`clients/${clientId}`, "GET", undefined, options);
}

export async function listFineractClients(
  options?: FineractProxyOptions & { limit?: number; offset?: number }
): Promise<ProxyResponse<any>> {
  const limit = options?.limit || 100;
  const offset = options?.offset || 0;
  return proxyToFineract(
    `clients?limit=${limit}&offset=${offset}`,
    "GET",
    undefined,
    options
  );
}

export async function createFineractClient(
  clientData: Record<string, unknown>,
  options?: FineractProxyOptions
): Promise<ProxyResponse<unknown>> {
  return proxyToFineract<unknown>("clients", "POST", clientData, options);
}

export async function getFineractLoan(
  loanId: number,
  options?: FineractProxyOptions
): Promise<ProxyResponse<unknown>> {
  return proxyToFineract<unknown>(`loans/${loanId}`, "GET", undefined, options);
}

export async function listFineractLoans(
  clientId?: number,
  options?: FineractProxyOptions & { limit?: number; offset?: number }
): Promise<ProxyResponse<any>> {
  const limit = options?.limit || 100;
  const offset = options?.offset || 0;
  const clientFilter = clientId ? `&clientId=${clientId}` : "";
  return proxyToFineract(
    `loans?limit=${limit}&offset=${offset}${clientFilter}`,
    "GET",
    undefined,
    options
  );
}

export async function createFineractLoan(
  loanData: Record<string, unknown>,
  options?: FineractProxyOptions
): Promise<ProxyResponse<unknown>> {
  return proxyToFineract<unknown>("loans", "POST", loanData, options);
}

export async function approveFineractLoan(
  loanId: number,
  approvalData: Record<string, unknown>,
  options?: FineractProxyOptions
): Promise<ProxyResponse<unknown>> {
  return proxyToFineract<unknown>(`loans/${loanId}?command=approve`, "POST", approvalData, options);
}

export async function disburseFineractLoan(
  loanId: number,
  disburseData: Record<string, unknown>,
  options?: FineractProxyOptions
): Promise<ProxyResponse<unknown>> {
  return proxyToFineract<unknown>(`loans/${loanId}?command=disburse`, "POST", disburseData, options);
}

export async function getLoanSchedule(
  loanId: number,
  options?: FineractProxyOptions
): Promise<ProxyResponse<unknown>> {
  return proxyToFineract<unknown>(
    `loans/${loanId}?associations=repaymentSchedule`,
    "GET",
    undefined,
    options
  );
}

export async function postLoanTransaction(
  loanId: number,
  transactionData: Record<string, unknown>,
  options?: FineractProxyOptions
): Promise<ProxyResponse<unknown>> {
  return proxyToFineract<unknown>(`loans/${loanId}?command=repayment`, "POST", transactionData, options);
}

export async function listSavingsAccounts(
  clientId?: number,
  options?: FineractProxyOptions & { limit?: number; offset?: number }
): Promise<ProxyResponse<any>> {
  const limit = options?.limit || 100;
  const offset = options?.offset || 0;
  const clientFilter = clientId ? `&clientId=${clientId}` : "";
  return proxyToFineract(
    `savingsaccounts?limit=${limit}&offset=${offset}${clientFilter}`,
    "GET",
    undefined,
    options
  );
}

export async function getGLAccounts(
  options?: FineractProxyOptions
): Promise<ProxyResponse<unknown>> {
  return proxyToFineract<unknown>("glaccounts?fetchRunningBalance=true", "GET", undefined, options);
}

export async function postJournalEntry(
  journalData: Record<string, unknown>,
  options?: FineractProxyOptions
): Promise<ProxyResponse<unknown>> {
  return proxyToFineract<unknown>("journalentries", "POST", journalData, options);
}

export async function listLoanProducts(
  options?: FineractProxyOptions
): Promise<ProxyResponse<unknown>> {
  return proxyToFineract<unknown>("loanproducts", "GET", undefined, options);
}

export async function getLoanProduct(
  productId: number,
  options?: FineractProxyOptions
): Promise<ProxyResponse<unknown>> {
  return proxyToFineract<unknown>(`loanproducts/${productId}`, "GET", undefined, options);
}
