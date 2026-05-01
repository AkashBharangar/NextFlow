import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { prisma } from "@/lib/prisma"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email = (body.email ?? "").trim().toLowerCase()

    // Basic email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      )
    }

    // Save to DB — if already exists, silently succeed
    const existing = await prisma.waitlistEntry.findUnique({
      where: { email },
    })

    if (!existing) {
      await prisma.waitlistEntry.create({
        data: { email, source: "api-docs" },
      })

      // Send confirmation email to the user
      await resend.emails.send({
        from: "Nexflow <onboarding@resend.dev>",
        to: email,
        subject: "You're on the Nexflow API waitlist ✦",
        html: `
          <div style="background:#080810;color:#ffffff;font-family:sans-serif;
          padding:40px;max-width:480px;margin:0 auto;border-radius:16px;">
            <div style="font-size:24px;font-weight:800;margin-bottom:8px;
            background:linear-gradient(135deg,#7c5cfc,#f43f8f);
            -webkit-background-clip:text;-webkit-text-fill-color:transparent;">
              ✦ Nexflow
            </div>
            <h2 style="color:#ffffff;font-size:20px;margin:24px 0 12px;">
              You're on the list.
            </h2>
            <p style="color:rgba(255,255,255,0.5);line-height:1.7;margin:0 0 24px;">
              Thanks for your interest in the Nexflow API. 
              We'll email you the moment it's ready — you'll be 
              among the first to get access.
            </p>
            <p style="color:rgba(255,255,255,0.3);font-size:13px;">
              — The Nexflow team
            </p>
          </div>
        `,
      })

      // Send notification email to yourself
      await resend.emails.send({
        from: "Nexflow <onboarding@resend.dev>",
        to: "akashbharangar_mc20b14_68@dtu.ac.in",
        subject: "New API waitlist signup",
        html: `
          <p>New signup: <strong>${email}</strong></p>
          <p>Source: api-docs</p>
          <p>Time: ${new Date().toISOString()}</p>
        `,
      })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("[waitlist] error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}