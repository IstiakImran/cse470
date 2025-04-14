import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/option";
import dbConnection from "@/lib/dbConnection";
import { RowDataPacket } from "mysql2";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { oldPassword, newPassword } = await request.json();

  try {
    const connection = await dbConnection();

    const [userResult] = await connection.execute<RowDataPacket[]>(
      `SELECT * FROM User WHERE email = ?`,
      [session.user.email]
    );
    const user = userResult[0];

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const isOldPasswordValid = await bcrypt.compare(
      oldPassword,
      user.password_hash
    );
    if (!isOldPasswordValid) {
      return NextResponse.json(
        { message: "Invalid old password" },
        { status: 400 }
      );
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await connection.execute(`UPDATE User SET password_hash = ? WHERE id = ?`, [
      hashedNewPassword,
      user.id,
    ]);

    return NextResponse.json(
      { message: "Password updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
