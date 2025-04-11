// netlify/functions/support-ticket.ts

// Import necessary types from @netlify/functions
import type {
    Handler,
    HandlerEvent,
    HandlerContext,
    HandlerResponse,
  } from "@netlify/functions";
  // Import axios for making HTTP requests
  import axios from "axios";
  
  /**
   * Interface defining the expected structure of the incoming request body.
   * Based on fields needed from the frontend's `SupportFormData`.
   */
  interface SupportPayload {
    name: string;
    email: string;
    company?: string;
    phone?: string;
    deviceModel?: string;
    serialNumber?: string; // EUI
    firmwareVersion?: string;
    problemType?: string;
    issueDescription: string;
    errorMessage?: string;
    stepsToReproduce?: string;
    supportMethod?: string;
    urgencyLevel?: string;
    // Files are excluded as they require separate handling
  }
  
  // Define the expected type for headers
  type ResponseHeaders = { [header: string]: string | number | boolean };
  
  // Define common headers for JSON responses (including CORS)
  const commonHeaders: ResponseHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*", // Adjust for production if needed
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  
  // Define headers for Method Not Allowed response
  const methodNotAllowedHeaders: ResponseHeaders = {
    ...commonHeaders,
    Allow: "POST, OPTIONS",
  };
  
  /**
   * Helper function to safely retrieve environment variables.
   */
  const getEnvVariable = (name: string): string => {
    const value = process.env[name];
    if (!value) {
      console.error(`Server Configuration Error: Missing environment variable ${name}.`);
      throw new Error(`Configuration error: Environment variable ${name} is not set.`);
    }
    return value;
  };
  
  /**
   * Formats the support data into an HTML string for the Zendesk ticket body.
   */
  const formatTicketBody = (data: SupportPayload): string => {
    const problemTypeMap: Record<string, string> = { connectivity: "Connectivity Issues", installation: "Installation Problems", configuration: "Configuration Help", hardware: "Hardware Malfunction", software: "Software/Firmware Issues", other: "Other Issue" };
    const urgencyLevelMap: Record<string, string> = { low: "Low", medium: "Medium", high: "High" };
  
    return `
      <h2>New RAK Support Request</h2>
      <p>A new support request has been submitted via the web form.</p>
      <hr>
      <h3>Client Information</h3>
      <ul>
        <li><strong>Name:</strong> ${data.name || "N/A"}</li>
        <li><strong>Email:</strong> ${data.email || "N/A"}</li>
        ${data.company ? `<li><strong>Company:</strong> ${data.company}</li>` : ""}
        ${data.phone ? `<li><strong>Phone:</strong> ${data.phone}</li>` : ""}
      </ul>
      <hr>
      <h3>Device Information</h3>
      <ul>
        <li><strong>Device Model:</strong> ${data.deviceModel || "N/A"}</li>
        <li><strong>Device EUI/Serial:</strong> ${data.serialNumber || "N/A"}</li>
        ${data.firmwareVersion ? `<li><strong>Firmware Version:</strong> ${data.firmwareVersion}</li>` : ""}
      </ul>
      <hr>
      <h3>Issue Details</h3>
      <ul>
        <li><strong>Problem Type:</strong> ${problemTypeMap[data.problemType || "other"] || data.problemType || "N/A"}</li>
        <li><strong>Urgency:</strong> ${urgencyLevelMap[data.urgencyLevel || ""] || data.urgencyLevel || "N/A"}</li>
      </ul>
      <p><strong>Issue Description:</strong></p>
      <p>${data.issueDescription ? data.issueDescription.replace(/\n/g, '<br>') : "No description provided."}</p>
      ${data.errorMessage ? `<p><strong>Error Message:</strong></p><p>${data.errorMessage.replace(/\n/g, '<br>')}</p>` : ""}
      ${data.stepsToReproduce ? `<p><strong>Steps to Reproduce:</strong></p><p>${data.stepsToReproduce.replace(/\n/g, '<br>')}</p>` : ""}
      <hr>
      <p><em>Ticket created via Web Support Form</em></p>
    `;
  };
  
  // The main Netlify Function handler
  const handler: Handler = async (event: HandlerEvent, context: HandlerContext): Promise<HandlerResponse> => {
  
    // Handle CORS preflight request
    if (event.httpMethod === "OPTIONS") {
      return { statusCode: 200, headers: commonHeaders, body: "" };
    }
  
    // 1. Check Method
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: JSON.stringify({ success: false, message: "Method Not Allowed." }), headers: methodNotAllowedHeaders };
    }
  
    // 2. Parse Body
    let payload: SupportPayload;
    try {
      if (!event.body) throw new Error("Missing request body");
      const rawPayload = JSON.parse(event.body);
      // Extract only expected fields
      payload = {
          name: rawPayload.name, email: rawPayload.email, company: rawPayload.company,
          phone: rawPayload.phone, deviceModel: rawPayload.deviceModel, serialNumber: rawPayload.serialNumber,
          firmwareVersion: rawPayload.firmwareVersion, problemType: rawPayload.problemType,
          issueDescription: rawPayload.issueDescription, errorMessage: rawPayload.errorMessage,
          stepsToReproduce: rawPayload.stepsToReproduce, supportMethod: rawPayload.supportMethod,
          urgencyLevel: rawPayload.urgencyLevel,
      };
    } catch (error) {
      console.error("Error parsing JSON body:", error);
      return { statusCode: 400, body: JSON.stringify({ success: false, message: "Invalid request body." }), headers: commonHeaders };
    }
  
    // 3. Validate Essential Data
    if (!payload.name || !payload.email || !payload.issueDescription) {
      return { statusCode: 400, body: JSON.stringify({ success: false, message: "Missing required fields: name, email, and issueDescription." }), headers: commonHeaders };
    }
  
    // 4. Get Zendesk Credentials
    let zendeskSubdomain: string, zendeskApiToken: string, zendeskUserEmail: string, zendeskGroupId: string;
    try {
      zendeskSubdomain = getEnvVariable("ZENDESK_SUBDOMAIN");
      zendeskApiToken = getEnvVariable("ZENDESK_API_TOKEN");
      zendeskUserEmail = getEnvVariable("ZENDESK_USER_EMAIL");
      zendeskGroupId = getEnvVariable("ZENDESK_TECH_SUPPORT_ASSIGNEE_ID"); // Group ID
    } catch (error: any) {
      // Server-side log is handled by getEnvVariable
      return { statusCode: 500, body: JSON.stringify({ success: false, message: "Internal server configuration error." }), headers: commonHeaders };
    }
  
    // 5. Construct Zendesk API Payload
    const zendeskApiUrl = `https://${zendeskSubdomain}.zendesk.com/api/v2/tickets.json`;
    const ticketSubject = `Support Request: ${payload.deviceModel || 'General Inquiry'} from ${payload.name}`;
    const ticketBody = formatTicketBody(payload);
    const zendeskTicketData = {
      ticket: {
        subject: ticketSubject,
        comment: { html_body: ticketBody },
        requester: { name: payload.name, email: payload.email, verified: true },
        group_id: parseInt(zendeskGroupId, 10),
        tags: ["web_support_form", "rak_support", payload.deviceModel || "unknown_device", `urgency_${payload.urgencyLevel || 'unknown'}`],
      },
    };
  
    // 6. Make API Call
    try {
      const authToken = Buffer.from(`${zendeskUserEmail}/token:${zendeskApiToken}`).toString("base64");
      console.log(`INFO: Sending request to Zendesk API: ${zendeskApiUrl}`);
      const response = await axios.post(zendeskApiUrl, zendeskTicketData, {
        headers: { "Content-Type": "application/json", Authorization: `Basic ${authToken}` },
      });
  
      // 7. Handle Success
      console.log(`SUCCESS: Created Zendesk ticket ID: ${response.data?.ticket?.id}`);
      return {
        statusCode: 201, // Created
        body: JSON.stringify({ success: true, message: "Support request submitted successfully!", ticketId: response.data?.ticket?.id }),
        headers: commonHeaders,
      };
  
    } catch (error: any) {
      // 8. Handle Zendesk API Error
      console.error("ERROR: Failed to create Zendesk ticket.");
      if (axios.isAxiosError(error)) {
        const status = error.response?.status || 500;
        console.error(`Zendesk API Error - Status: ${status}`, JSON.stringify(error.response?.data, null, 2));
        let userMessage = "Failed to submit support request due to a server error.";
        if (status === 401 || status === 403) userMessage = "Authentication failed with Zendesk.";
        else if (status === 422) userMessage = `Invalid data sent to Zendesk: ${error.response?.data?.description || 'Validation error'}`;
        else if (status === 429) userMessage = "Rate limit exceeded contacting support system. Please try again later.";
        else userMessage = `Failed to communicate with support system (Status: ${status}).`;
  
        return {
          statusCode: status >= 500 ? 500 : status,
          body: JSON.stringify({ success: false, message: userMessage }),
          headers: commonHeaders,
        };
      } else {
        console.error("Unexpected error:", error);
        return {
          statusCode: 500,
          body: JSON.stringify({ success: false, message: "An unexpected error occurred." }),
          headers: commonHeaders,
        };
      }
    }
  };
  
  // Export the handler
  export { handler };