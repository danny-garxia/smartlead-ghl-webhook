import axios from "axios";

export default async function handler(req, res) {
  try {
    const data = req.body;

    // ✅ Only process replies
    if (data.event_type !== "EMAIL_REPLY") {
      return res.status(200).send("Ignored");
    }

    const leadId = data.sl_email_lead_id;
    const email = data.sl_lead_email;
    const name = data.to_name;

    // 🔑 Smartlead API call
    const leadRes = await axios.get(
      `https://server.smartlead.ai/api/v1/leads/${leadId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.6e9c8915-7c57-4021-8abc-2a737731d800_borhntf`,
        },
      }
    );

    const lead = leadRes.data;

    // 🧹 Clean reply message
    let message = data.reply_message?.text || "";
    message = message.replace(
      "##- Please type your reply above this line -##",
      ""
    ).trim();

    const lower = message.toLowerCase();

    // ❌ Ignore STOP messages
    if (
      lower.includes("stop") ||
      lower.includes("unsubscribe") ||
      lower.includes("remove")
    ) {
      return res.status(200).send("Unsubscribed");
    }

    // 📦 Send to GHL
    await axios.post(process.env.GHL_WEBHOOK_URL, {
      email: lead.email || email,
      name: lead.name || name,
      phone: lead.phone || "",
      address: lead?.custom_fields?.address || "",
      message: message,
      campaign: data.campaign_name
    });

    return res.status(200).send("Success");
  } catch (err) {
    console.error(err);
    return res.status(500).send("Error");
  }
}
