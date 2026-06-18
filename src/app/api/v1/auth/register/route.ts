import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";
import { registerSchema } from "@/lib/validations/auth";
import { getIpAddress } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const { email, password, firstName, lastName, phone } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const ip = getIpAddress(req);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          firstName,
          lastName,
          name: `${firstName} ${lastName}`,
          phone,
          role: "CUSTOMER",
          status: "PENDING_VERIFICATION",
        },
      });

      // Log consent
      await tx.consentLog.create({
        data: {
          userId: newUser.id,
          email,
          consentType: "terms_and_privacy",
          version: "1.0",
          accepted: true,
          ipAddress: ip,
          userAgent: req.headers.get("user-agent") || undefined,
        },
      });

      return newUser;
    });

    // TODO: Send email verification

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful. Please verify your email.",
        data: { id: user.id, email: user.email },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
