import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { identifiant } = await request.json();

    const { data, error } = await resend.emails.send({
      from: "Urgences Formalités <onboarding@resend.dev>",
      to: "contact@urgencesformalites.fr",
      subject: "Demande de réinitialisation de mot de passe",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; background-color: #008ebe; color: white; font-weight: bold; font-size: 20px; width: 50px; height: 50px; line-height: 50px; border-radius: 12px;">UF</div>
          </div>
          <h2 style="color: #008ebe; text-align: center;">Demande de réinitialisation de mot de passe</h2>
          <div style="background-color: #f7f9fc; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e2e8f0;">
            <p style="margin: 0; color: #1e293b;">
              Un utilisateur a demandé la réinitialisation de son mot de passe sur l'application de dépôt INPI.
            </p>
            ${identifiant ? `<p style="margin: 10px 0 0; color: #1e293b;"><strong>Identifiant / Email :</strong> ${identifiant}</p>` : ""}
          </div>
          <p style="color: #64748b; font-size: 13px; text-align: center; margin-top: 30px;">
            Application Dépôts INPI — Urgences Formalités
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Erreur lors de l'envoi de l'email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
