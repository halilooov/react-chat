// нормализация структура
// имитация БД
const users = {
    1: {username: 'Alice', online: false},
    2: {username: 'Bob', online: false},
}

export default (io, socket) => {
    // обрабатываем запрос на получение пользователей
    // свойство "roomId" является распределенным,
    // посокольку используется как для работы с пользователями,
    // так и для работы с сообщениями
    const getUsers = () => {
        io.in(socket.roomId).emit('users', users)
    }

    // обрабатываем добавление пользователя
    // функция принимает объект с именем пользователя и его id
    const addUser = ({ username, userId }) => {
        // проверяем, имеется ли пользователь в БД
        if (!users[userId]) {
            // если не имеется, добавляем его в БД
            users[userId] = { username, online: true }
        } else {
            users[userId].online = true
        }
        // выполняем запрос на получения пользователей
        getUsers()
    }

    // обрабатываем удаления пользователя
    const removeUser = userId => {
        // одно из преимуществ нормализованных структур состоит в том,
        // что мы можем моментально (O(1)) получать данные по ключу
        // это актуально только для изменяемых (мутабельных) данных
        // в redux, например, без immer, нормализованные структуры
        // привносят дополнительную сложность
        users[userId].online = false
        getUsers()
    }

    // регистрируем обработчики
    socket.on('user:get', getUsers)
    socket.on('user:add', addUser)
    socket.on('user:leave', removeUser)
}