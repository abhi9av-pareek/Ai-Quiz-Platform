import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// database code for signup // authentication

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, contactNumber, educationLevel } = req.body;

    // 1. Validate required fields
    if (!name || !email || !password || !contactNumber || !educationLevel) {
      return res.status(400).json({
        message:
          "All fields are required (name, email, password, contactNumber, educationLevel)",
      });
    }

    // 2. Validate contact number (basic check: 10 digits)
    if (!/^[0-9]{10}$/.test(contactNumber)) {
      return res.status(400).json({
        message: "Contact number must be exactly 10 digits",
      });
    }

    // 3. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      contactNumber,
      educationLevel,
    });

    // 6. Response
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      contactNumber: user.contactNumber,
      educationLevel: user.educationLevel,
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

//  LOGIN code
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // check user
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      //  generate JWT token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: token, // important
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};
