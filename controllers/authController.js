const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../model/User");

const handleLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and Password are required" });

  try {
    const foundUser = await User.findOne({
      email: email,
      archive: false,
      verified: true,
    });
    if (!foundUser)
      return res.status(401).json({ message: "Unauthorized: User not found" });

    const match = await bcrypt.compare(password, foundUser.password);
    if (!match)
      return res.status(401).json({ message: "Incorrect email or password" });

    foundUser.refreshToken = null; // Clear existing refresh token

    const fullname = `${foundUser.firstname} ${foundUser.lastname}`;
    const id = foundUser._id;

    const accessToken = jwt.sign(
      {
        UserInfo: {
          id: id,
          email: foundUser.email,
          fullname: fullname,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    const refreshToken = jwt.sign(
      { email: foundUser.email },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    foundUser.refreshToken = refreshToken;
    await foundUser.save();

    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: isProduction ? "None" : "Lax", // Adjust SameSite attribute for dev
      secure: isProduction, // Secure cookie only in production
    });

    const userImageBuffer = foundUser.userImage?.toString("base64");
    const userImage = `data:image/png;base64,${userImageBuffer}`;

    res.json({ ...foundUser, userImage, accessToken, fullname });
  } catch (error) {
    console.error("Login Error: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { handleLogin };
