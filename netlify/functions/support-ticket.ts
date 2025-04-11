// netlify/functions/support-ticket.ts

import type {
  Handler,
  HandlerEvent,
  HandlerContext,
  HandlerResponse,
} from "@netlify/functions";
import axios from "axios";

/**
 * Interface defining the expected structure of the incoming request body.
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
  previousTicketId?: string; // ADDED
  supportMethod?: string; // Keep if needed for routing/logic later
  urgencyLevel?: string;
  // Flag derived from frontend data
  hasAttachments?: boolean;
  // hasErrorScreenshots?: boolean; // REMOVED
}

type ResponseHeaders = { [header: string]: string | number | boolean };

const commonHeaders: ResponseHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*", // Be more specific in production
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

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

  // Section for mentioning attachments
  let attachmentInfo = '';
  if (data.hasAttachments) { // Only check hasAttachments now
    attachmentInfo += '<hr>\n<h3>File Attachments</h3>\n<p><strong>Note:</strong> User indicated file(s) were attached to the form submission.</p>\n';
    attachmentInfo += '<p><em>(Actual files are not attached to this ticket via this submission method. Please request them from the user if needed.)</em></p>';
  }

  // Section for previous ticket ID
  let previousTicketInfo = '';
  if (data.previousTicketId && data.previousTicketId.trim() !== '') { // Check if ID has content
      previousTicketInfo = `<p><strong>Previous Ticket Reference:</strong> ${data.previousTicketId.trim()}</p>`;
  }

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
      <li><strong>Device EUI/Serial:</strong> ${data.serialNumber || "Not Provided"}</li> {/* Updated text */}
      ${data.firmwareVersion ? `<li><strong>Firmware Version:</strong> ${data.firmwareVersion}</li>` : ""}
    </ul>
    <hr>
    <h3>Issue Details</h3>
    <ul>
      <li><strong>Problem Type:</strong> ${problemTypeMap[data.problemType || "other"] || data.problemType || "N/A"}</li>
      <li><strong>Urgency:</strong> ${urgencyLevelMap[data.urgencyLevel || ""] || data.urgencyLevel || "N/A"}</li>
    </ul>
    ${previousTicketInfo} {/* ADDED Previous Ticket Info */}
    <p><strong>Issue Description:</strong></p>
    <p>${data.issueDescription ? data.issueDescription.replace(/\n/g, '<br>') : "No description provided."}</p>
    ${data.errorMessage ? `<p><strong>Error Message:</strong></p><p>${data.errorMessage.replace(/\n/g, '<br>')}</p>` : ""}
    ${data.stepsToReproduce ? `<p><strong>Steps to Reproduce:</strong></p><p>${data.stepsToReproduce.replace(/\n/g, '<br>')}</p>` : ""}
    ${attachmentInfo} {/* Insert attachment note */}
    <hr>
    <p><em>Ticket created via Web Support Form</em></p>
  `;
};


const handler: Handler = async (event: HandlerEvent, context: HandlerContext): Promise<HandlerResponse> => {

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: commonHeaders, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ success: false, message: "Method Not Allowed." }), headers: methodNotAllowedHeaders };
  }

  let payload: SupportPayload;
  try {
    if (!event.body) throw new Error("Missing request body");
    const rawPayload = JSON.parse(event.body);
    // Extract fields including new previousTicketId and check attachments array
    payload = {
        name: rawPayload.name, email: rawPayload.email, company: rawPayload.company,
        phone: rawPayload.phone, deviceModel: rawPayload.deviceModel, serialNumber: rawPayload.serialNumber,
        firmwareVersion: rawPayload.firmwareVersion, problemType: rawPayload.problemType,
        issueDescription: rawPayload.issueDescription, errorMessage: rawPayload.errorMessage,
        stepsToReproduce: rawPayload.stepsToReproduce,
        previousTicketId: rawPayload.previousTicketId, // ADDED
        supportMethod: rawPayload.supportMethod,
        urgencyLevel: rawPayload.urgencyLevel,
        // Check if attachments array existed and had items
        hasAttachments: Array.isArray(rawPayload.attachments) && rawPayload.attachments.length > 0,
        // hasErrorScreenshots: ... // REMOVED
    };
  } catch (error: any) {
    console.error("Error parsing JSON body:", error.message);
    return { statusCode: 400, body: JSON.stringify({ success: false, message: "Invalid request body." }), headers: commonHeaders };
  }

  // Validation still requires name, email, description
  if (!payload.name || !payload.email || !payload.issueDescription) {
    const missing = [ /* ... */ ].filter(Boolean).join(', ');
    console.warn(`Validation Error: Missing required fields: ${missing}`);
    return { statusCode: 400, body: JSON.stringify({ success: false, message: `Missing required fields: name, email, and issueDescription.` }), headers: commonHeaders };
  }

  // Get Zendesk Credentials
  let zendeskSubdomain: string, zendeskApiToken: string, zendeskUserEmail: string, zendeskGroupId: string;
   try {
    zendeskSubdomain = getEnvVariable("ZENDESK_SUBDOMAIN");
    zendeskApiToken = getEnvVariable("ZENDESK_API_TOKEN");
    zendeskUserEmail = getEnvVariable("ZENDESK_USER_EMAIL");
    zendeskGroupId = getEnvVariable("ZENDESK_TECH_SUPPORT_ASSIGNEE_ID");
  } catch (error: any) {
    return { statusCode: 500, body: JSON.stringify({ success: false, message: "Internal server configuration error." }), headers: commonHeaders };
  }

  const zendeskApiUrl = `https://${zendeskSubdomain}.zendesk.com/api/v2/tickets.json`;
  const ticketSubject = `Support Request: ${payload.deviceModel || 'General Inquiry'} from ${payload.name}`;
  const ticketBody = formatTicketBody(payload); // Includes attachment note and previous ID now

  const zendeskTicketData = {
    ticket: {
      subject: ticketSubject,
      comment: { html_body: ticketBody },
      requester: { name: payload.name, email: payload.email, verified: true },
      group_id: parseInt(zendeskGroupId, 10),
      tags: ['TTR-tech-support'],
      priority: payload.urgencyLevel === 'high' ? 'high'
               : payload.urgencyLevel === 'medium' ? 'normal'
               : 'low',
    },
  };

  // Make API Call
  try {
      const authToken = Buffer.from(`${zendeskUserEmail}/token:${zendeskApiToken}`).toString("base64");
      console.log(`INFO: Sending request to Zendesk API: ${zendeskApiUrl}`);
      const response = await axios.post(zendeskApiUrl, zendeskTicketData, {
        headers: { "Content-Type": "application/json", Authorization: `Basic ${authToken}` },
        timeout: 15000 // 15 seconds timeout
      });

      // Handle Success
      const createdTicketId = response.data?.ticket?.id;
      console.log(`SUCCESS: Created Zendesk ticket ID: ${createdTicketId}`);
      return {
        statusCode: 201,
        body: JSON.stringify({ success: true, message: "Support request submitted successfully!", ticketId: createdTicketId || null }),
        headers: commonHeaders,
      };

    } catch (error: any) {
        // Handle Zendesk API Error
         console.error("ERROR: Failed to create Zendesk ticket.");
        if (axios.isAxiosError(error)) {
             const status = error.response?.status || 500;
             console.error(`Zendesk API Error - Status: ${status}`, JSON.stringify(error.response?.data || error.message, null, 2));
             let userMessage = "Failed to submit support request due to a server error.";
             if (status === 401 || status === 403) userMessage = "Authentication failed with support system. Please contact administrator.";
             else if (status === 422) userMessage = `Invalid data sent to support system: ${error.response?.data?.description || 'Validation error'}`;
             else if (status === 429) userMessage = "Rate limit exceeded contacting support system. Please try again later.";
             else if (error.code === 'ECONNABORTED') userMessage = "Request to support system timed out. Please try again.";
             else userMessage = `Failed to communicate with support system (Status: ${status}).`;

            return {
                statusCode: status >= 500 ? 500 : status,
                body: JSON.stringify({ success: false, message: userMessage }),
                headers: commonHeaders,
            };
        } else {
           console.error("Unexpected error during Zendesk call:", error);
            return {
                statusCode: 500,
                body: JSON.stringify({ success: false, message: "An unexpected error occurred." }),
                headers: commonHeaders,
            };
        }
    }
};

export { handler };