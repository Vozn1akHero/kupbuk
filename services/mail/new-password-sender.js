import transporter from '../../modules/nodemailer';

const newPasswordSender = async (userEmail, newPassword) => {
    await transporter.sendMail({
        from: '"Kubpuk" <admin@kupbuk.pl>',
        to: userEmail,
        subject: "Resetowanie hasła na Kupbuk",
        text: `Zresetowałeś hasło na Kupbuk. Twoje nowe hasło to ${newPassword}. Korzystaj z niego aby się logować na Kupbuk.`
    });

};

export default newPasswordSender;
