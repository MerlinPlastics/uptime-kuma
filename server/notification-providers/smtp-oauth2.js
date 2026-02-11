const NotificationProvider = require("./notification-provider");
const { log } = require("../../src/util");

class SMTPOAuth2 extends NotificationProvider {
    name = "smtpOAuth2";

    /**
     * Fetch an OAuth2 access token from Microsoft using client credentials flow
     * @param {object} notification Notification config
     * @returns {Promise<string>} Access token
     */
    async fetchAccessToken(notification) {
        const tenantId = notification.smtpOAuth2TenantId || "common";
        const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

        const params = new URLSearchParams();
        params.append("grant_type", "client_credentials");
        params.append("client_id", notification.smtpOAuth2ClientId);
        params.append("client_secret", notification.smtpOAuth2ClientSecret);
        params.append("scope", "https://graph.microsoft.com/.default");

        log.debug("notification", `Requesting OAuth2 token from: ${tokenUrl}`);

        const response = await fetch(tokenUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: params.toString(),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            log.error("notification", `OAuth2 token request failed: ${response.status} ${errorBody}`);
            throw new Error(`Failed to obtain OAuth2 access token: ${response.status} - ${errorBody}`);
        }

        const data = await response.json();
        log.debug("notification", "OAuth2 token obtained successfully");
        
        if (!data.access_token) {
            log.error("notification", "No access token in response");
            throw new Error("No access token returned from OAuth2 endpoint");
        }

        return data.access_token;
    }

    /**
     * @inheritdoc
     */
    async send(notification, msg, monitorJSON = null, heartbeatJSON = null) {
        const okMsg = "Sent Successfully.";

        log.debug("notification", `Fetching OAuth2 access token for ${notification.smtpOAuth2SenderAddress}`);
        const accessToken = await this.fetchAccessToken(notification);

        // Default values in case the user does not want to template
        let subject = msg;
        let body = msg;
        let useHTMLBody = false;
        if (heartbeatJSON) {
            body = `${msg}\nTime (${heartbeatJSON["timezone"]}): ${heartbeatJSON["localDateTime"]}`;
        }

        // Subject and body are templated
        if ((monitorJSON && heartbeatJSON) || msg.endsWith("Testing")) {
            const customSubject = notification.smtpOAuth2CustomSubject?.trim() || "";
            const customBody = notification.smtpOAuth2CustomBody?.trim() || "";
            if (customSubject !== "") {
                subject = await this.renderTemplate(customSubject, msg, monitorJSON, heartbeatJSON);
            }
            if (customBody !== "") {
                useHTMLBody = notification.smtpOAuth2HtmlBody || false;
                body = await this.renderTemplate(customBody, msg, monitorJSON, heartbeatJSON);
            }
        }

        // Parse recipients
        const toRecipients = this.parseEmailAddresses(notification.smtpOAuth2To);
        const ccRecipients = this.parseEmailAddresses(notification.smtpOAuth2CC);
        const bccRecipients = this.parseEmailAddresses(notification.smtpOAuth2BCC);

        // Build Graph API message
        const message = {
            message: {
                subject: subject,
                body: {
                    contentType: useHTMLBody ? "HTML" : "Text",
                    content: body,
                },
                toRecipients: toRecipients,
                ccRecipients: ccRecipients,
                bccRecipients: bccRecipients,
            },
            saveToSentItems: true,
        };

        // Send via Microsoft Graph API
        const graphUrl = `https://graph.microsoft.com/v1.0/users/${notification.smtpOAuth2SenderAddress}/sendMail`;
        
        log.debug("notification", `Sending email via Microsoft Graph API for ${notification.smtpOAuth2SenderAddress}`);

        try {
            const response = await fetch(graphUrl, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(message),
            });

            if (!response.ok) {
                const errorBody = await response.text();
                log.error("notification", `Graph API sendMail failed: ${response.status} ${errorBody}`);
                throw new Error(`Failed to send email via Microsoft Graph: ${response.status} - ${errorBody}`);
            }

            log.info("notification", "Email sent successfully via Microsoft Graph API");
        } catch (error) {
            log.error("notification", `Microsoft Graph send failed: ${error.message}`);
            throw new Error(
                `Failed to send email via Microsoft Graph API. Ensure the app has Mail.Send permission. ` +
                `Original error: ${error.message}`
            );
        }

        return okMsg;
    }

    /**
     * Parse email addresses into Graph API recipient format
     * @param {string} emailString Comma-separated email addresses
     * @returns {Array} Array of recipient objects
     */
    parseEmailAddresses(emailString) {
        if (!emailString || emailString.trim() === "") {
            return [];
        }

        return emailString
            .split(",")
            .map(email => email.trim())
            .filter(email => email.length > 0)
            .map(email => ({
                emailAddress: {
                    address: email,
                },
            }));
    }
}

module.exports = SMTPOAuth2;
