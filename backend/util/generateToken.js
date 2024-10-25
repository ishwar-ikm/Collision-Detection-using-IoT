import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (userId, res) => {
    const token = jwt.sign({userId}, process.env.JWT_SECRET, {
        expiresIn: '15d'
    });

    res.cookie("jwt", token, {
        maxAge: 15*24*60*60*1000,
        httpOnly: true, // prevent XXS attacks ie cross site scripting attacks
        sameSite: "none", // CSRF attacks ie cross-site request forgery attacks
        secure: true
    })
}