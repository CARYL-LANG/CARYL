import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import nodemailer from "npm:nodemailer@6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const ADMIN_EMAIL = "admin@gmail.com";

interface GmailAccount {
  email: string;
  appPassword: string;
}

function getGmailAccounts(): GmailAccount[] {
  const accounts: GmailAccount[] = [];
  let i = 1;
  while (true) {
    const email = Deno.env.get(`GMAIL_USER_${i}`);
    const appPassword = Deno.env.get(`GMAIL_APP_PASSWORD_${i}`);
    if (!email || !appPassword) break;
    accounts.push({ email, appPassword });
    i++;
  }
  return accounts;
}

function generateOtp(): string {
  const digits = "0123456789";
  let code = "";
  const arr = new Uint32Array(6);
  crypto.getRandomValues(arr);
  for (let i = 0; i < 6; i++) {
    code += digits[arr[i] % digits.length];
  }
  return code;
}

async function sendEmail(
  from: string,
  appPassword: string,
  to: string,
  subject: string,
  body: string
): Promise<void> {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: from,
      pass: appPassword,
    },
  });

  await transporter.sendMail({
    from,
    to,
    subject,
    text: body,
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Determine account type
    let accountType: string | null = null;

    if (normalizedEmail === ADMIN_EMAIL) {
      accountType = "admin";
    } else {
      const { data: staff } = await adminClient
        .from("staff_accounts")
        .select("id")
        .ilike("email", normalizedEmail)
        .maybeSingle();

      if (staff) {
        accountType = "staff";
      } else {
        const { data: customer } = await adminClient
          .from("customers")
          .select("id")
          .ilike("email", normalizedEmail)
          .maybeSingle();

        if (customer) {
          accountType = "customer";
        }
      }
    }

    if (!accountType) {
      return new Response(
        JSON.stringify({ error: "No account found with that email address" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate 6-digit code
    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    // Store the OTP code
    const { error: insertError } = await adminClient
      .from("otp_codes")
      .insert({
        email: normalizedEmail,
        code,
        account_type: accountType,
        expires_at: expiresAt,
        used: false,
      });

    if (insertError) throw insertError;

    // Get Gmail accounts and pick one at random
    const gmailAccounts = getGmailAccounts();
    if (gmailAccounts.length === 0) {
      throw new Error("No Gmail accounts configured. Please add GMAIL_USER_1 and GMAIL_APP_PASSWORD_1 as edge function secrets.");
    }

    const senderIndex = Math.floor(Math.random() * gmailAccounts.length);
    const sender = gmailAccounts[senderIndex];

    const subject = "Pring Kuyas Inn - Password Reset Code";
    const body = `Hello,

You requested a password reset for your Pring Kuyas Inn account.

Your 6-digit verification code is: ${code}

This code will expire in 10 minutes.

If you did not request this reset, please ignore this email.

- Pring Kuyas Inn Management`;

    await sendEmail(sender.email, sender.appPassword, normalizedEmail, subject, body);

    return new Response(
      JSON.stringify({ success: true, accountType }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send OTP";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
