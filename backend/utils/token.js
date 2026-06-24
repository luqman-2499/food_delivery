import jwt from 'jsonwebtoken'

const genToken = (userId) => { // Create Token for this particular User using his ID 
    try {
        // Create Token along with attaching userId using the sign() Method to sign token with our secret code.
        const token = jwt.sign({userId}, process.env.JWT_SECRET, {expiresIn: "7d"}) 
            return token

    } catch (error) {
        console.log(error);
        
    }
}
export default genToken 