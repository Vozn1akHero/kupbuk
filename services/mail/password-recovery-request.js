import transporter from '../../modules/nodemailer';

const onPasswordRecoveryRequestMail = async (userEmail, token) => {
    await transporter.sendMail({
        from: '"Kubpuk" <admin@kupbuk.pl>',
        to: userEmail,
        subject: "Resetowanie hasła na Kupbuk",
        text: `Kliknij w ten link aby zresetować hasło http://localhost:3001/reset-password?token=${token}`
    });

};

export default onPasswordRecoveryRequestMail;
