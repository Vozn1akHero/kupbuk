import axios from 'axios';

exports.addOfferToTheBasket = (id) => {
    axios.post('/new-order', {
        offerId: id
    });
};
