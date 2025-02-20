// app/api/auth/signup/route.js
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDB, initializeDatabase } from "@/lib/db";
import { User } from "@/models/User";

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    // Initialize database and create collections if they don't exist
    await initializeDatabase();
    
    // Connect to database
    await connectToDB();

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      return NextResponse.json(
        { message: "Email already exists" },
        { status: 400 }
      );
    }
    
    // Handle database connection errors
    if (error.name === 'MongoServerError') {
      return NextResponse.json(
        { message: "Database connection error. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Error creating user" },
      { status: 500 }
    );
  }
}