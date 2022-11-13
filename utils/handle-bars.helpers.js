module.exports = {
    customif: (options) => {
        return (options.hash.expected === options.hash.val) ? options.fn(this) : options.inverse(this);
    },
    ifEquals: (option1, option2) => {
        return option1 === option2;
    },
    length: (option1) => {
        return option1.length;
    },
    ifNotEquals: (option1, option2) => {
        return option1 !== option2;
    },
    count: (option1) => {
        return option1.length;
    },
    valueAtIndex: (values, index) => {
        return values[index];
    },
    valueAtKey: (values, key) => {
        return values.get(key);
    },
    menuActive: (option1, option2) => {
        if (option1 == option2) {
            return 'active';
        }
        return false;
    },
}