const users = [];

const findUserByEmail = (email) => {
    return users.find((user) => user.email === email);
};

const findUserById = (id) => {
    return users.find((user) => user.id === id);
};

const addUser = (user) => {
    users.push(user);
    return user;
};

module.exports = {
    users,
    findUserByEmail,
    findUserById,
    addUser
};