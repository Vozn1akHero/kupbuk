import sequelize from './sequelize'

import Category from '../models/category';
import Cover from '../models/cover';
import Offer from '../models/offer';
import User from '../models/user';
import BookState from '../models/book-state';
import PasswordResetterTemp from '../models/other/auth/password-resetter';
import EmailConfirmationTemp from '../models/other/auth/email-confirmation';
import EmailAlteringConfirmationTemp from '../models/other/auth/email-altering-confirmation';


const modelsDbSynchronizerFunc = () => {
    sequelize.sync().then(() =>
        console.log("tables are created")
    );

    Category.sync();
    Cover.sync();
    Offer.sync();
    User.sync();
    BookState.sync();

    PasswordResetterTemp.sync();
    EmailConfirmationTemp.sync();
    EmailAlteringConfirmationTemp.sync();
};

export default modelsDbSynchronizerFunc;
