const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(
    'newskill',
    'root',
    '760517Gg',
    {
        host: 'localhost',
        dialect: 'mysql'
    }
);

sequelize.authenticate().then(() => {
    console.log('Connection has been established successfully.');
}).catch((error) => {
    console.error('Unable to connect to the database: ', error);
});

const User = sequelize.define("users", {
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
    },
});



sequelize.sync().then(() => {
    console.log('User table created successfully!');
}).catch((error) => {
    console.error('Unable to create table : ', error);
});


User.findAll().then(res => {
    console.log(res)
}).catch((error) => {
    console.error('Failed to retrieve data : ', error);
});

module.exports = User;