import transporter from '../../modules/nodemailer';

const emailConfirmationLinkSender = async (userEmail, token) => {
    await transporter.sendMail({
        from: '"Kubpuk" <admin@kupbuk.pl>',
        to: userEmail,
        subject: "Potwierdzenie email na Kupbuk",
        text: `Kliknij w ten link aby potwierdzić email http://localhost:3001/auth/confirm-email?token=${token}`
    });
};

export default emailConfirmationLinkSender;
