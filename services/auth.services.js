const jwt = require('jsonwebtoken');
const randomstring = require('randomstring');
const nodemailer = require('nodemailer');
const {google} = require('googleapis');


const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URL = process.env.REDIRECT_URL;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const CLIENT_GMAIL = process.env.CLIENT_GMAIL;
const STATUS_VERIFY = process.env.STATUS_VERIFY;

module.exports = {
    generateOTPCode(){
        return randomstring.generate({
            length: 6,
            charset: 'numeric'    
        });
    },
    generateOTPToken(otpCode){
        return jwt.sign({
            otp: otpCode
        },STATUS_VERIFY,{
            expiresIn:"10m"
        });
    },
    checkOTPValid(otpCode, token) { 
        const decoded = jwt.decode(token,{
            ignoreExpiration:true
        })
        if(decoded.otp != otpCode){
            return false;
        }
        return true;
    },
    async sendMail(toEmail, otpCode){
        try{
            const oauth2Client = new google.auth.OAuth2(
                CLIENT_ID,
                CLIENT_SECRET,
                REDIRECT_URL
            );
            oauth2Client.setCredentials({
                refresh_token: REFRESH_TOKEN
            })
            const accessToken = await oauth2Client.getAccessToken();
            const transport = nodemailer.createTransport({
                service:'gmail',
                auth: {
                    type: 'Oauth2',
                    user: CLIENT_GMAIL,
                    clientId: CLIENT_ID,
                    clientSecret: CLIENT_SECRET,
                    refreshToken: REFRESH_TOKEN,
                    accessToken: accessToken
                }
            });
            const mailOptions = {
                from: `Activation Online Course Account<${CLIENT_GMAIL}>`,
                to: `${toEmail}`,
                subject: "Activate your account",
                html: `
                    <h1>Please use the following OTP to activate your account</h1>
                    <h3>${otpCode}</h3>
                    <hr />
                    <p>This email may containe sensetive information, please don't reply!</p>
                    <p>Best regard.</p>
                `
            }
            const result = await  transport.sendMail(mailOptions);
            return result;
        }catch(err){
            console.log(err);
        }
    }
}