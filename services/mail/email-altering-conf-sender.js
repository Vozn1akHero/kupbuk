import transporter from '../../modules/nodemailer';

const emailConfirmationLinkSender = async (userEmail, token) => {
    await transporter.sendMail({
        from: '"Kubpuk" <admin@kupbuk.pl>',
        to: userEmail,
        subject: "Potwierdzenie zmiany emil na Kupbuk",
        text: `Kliknij w ten link aby potwierdzić zmianę email http://localhost:3001/auth/change-email?token=${token}`
    });
};

export default emailConfirmationLinkSender;
