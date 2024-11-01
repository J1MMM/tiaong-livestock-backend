const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const Student = require('../model/Student');

const handleLogin = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Username and Password are required" })

    const foundUser = await Student.findOne({ username: email }).exec();
    if (!foundUser) return res.status(401).json({ message: `Account with username '${email}' not found` })

    const match = await bcrypt.compare(password, foundUser.password);
    if (match == false) return res.status(401).json({ message: `Incorrect password` })

    try {
        const fullname = `${foundUser.firstname.charAt(0).toUpperCase()}${foundUser.firstname.slice(1)} ${foundUser.lastname.charAt(0).toUpperCase()}${foundUser.lastname.slice(1)}`

        res.json({ foundUser, fullname })
    } catch (error) {
        console.log(error)
        res.status(400).json({ "message": error.message })
    }
}

module.exports = { handleLogin }