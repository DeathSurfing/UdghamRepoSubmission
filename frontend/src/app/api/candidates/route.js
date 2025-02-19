import { NextResponse } from "next/server";
import { connectToDatabase } from "@/backend/config/db";
import Candidate from "@/backend/models/Candidate"; // Import the model

export async function POST(req) {
  try {
    await connectToDatabase(); // Connect to DB
    const body = await req.json();

    const newCandidate = new Candidate({
      name: body.name,
      email: body.email,
      cvUrl: body.cvUrl, // This will be handled later when we implement file uploads
    });

    await newCandidate.save();
    return NextResponse.json({ success: true, message: "Candidate saved successfully" });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
