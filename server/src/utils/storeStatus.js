const getTodayDateString = () => new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'

const isStoreOpenNow = (dealer) => {
    return Boolean(dealer.isOpenToday && dealer.lastOpenedDate === getTodayDateString());
};

module.exports = { getTodayDateString, isStoreOpenNow };
