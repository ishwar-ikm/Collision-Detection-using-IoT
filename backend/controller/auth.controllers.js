import User from "../model/user.model.js";  
import { genSalt, hash, compare } from 'bcrypt';
import { generateTokenAndSetCookie } from "../util/generateToken.js";

export const register = async (req, res) => {
  const { fullName, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    const salt = await genSalt(10);
    const hashedPassword = await hash(password, salt);

    const newUser = new User({ fullName, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    res.status(500).json({ error: 'Error registering user' });
  }
}

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(user);
    
    const isMatch = await compare(password, user.password);
    console.log(isMatch);
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    generateTokenAndSetCookie(user._id, res);

    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Error logging in' });
  }
}

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.log("Error in logout", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export const getMe = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in getMe", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
}