import { nanoid } from 'nanoid'
// настраиваем БД
import { Low, JSONFile } from 'lowdb'
// БД храниться в директории "db" под названием "messages.json"
const adapter = new JSONFile('db/messages.json')
const db = new Low(adapter)

// записываем в БД начальные данные
await db.read()
db.data = {
    messages: [
        {
            messageId: '1',
            userId: '1',
            senderName: 'Bob',
            messageText: 'What are you doing here?',
            createdAt: '2021-01-14'
        },
        {
            messageId: '2',
            userId: '2',
            senderName: 'Alice',
            messageText: 'Go back to work!',
            createdAt: '2021-02-15'
        }
    ]
}
await db.write()

console.log(db.data)


export default (io, socket) => {
    // обрабатываем запрос на получение сообщений
    const getMessages = () => {
        // получаем сообщения из БД
        const messages = db.get('messages').value()
        // передаем сообщения пользователям, находящимся в комнате
        // сионимы - распространения, вещание, публикация
        io.in(socket.roomId).emit('messages', messages)
    }

    // обрабатываем добавления сообщения
    // функция принимает объект сообщения
    const addMessage = message => {
        db.get('messages')
            // генерируем идентификатор с помощью nanoid, 8 - длина id
            .push({
                messageId: nanoid(8),
                createdAt: new Date(),
                ...message
            })
            .write()

        // выполняем запрос на получение сообщений
        getMessages()
    }

    // обрабатывем удаления сообщения
    // функция принимает id сообщения
    const removeMessage = messageId => {
        db.get('messages').remove({ messageId }).write()

        getMessages()
    }

    // регистрируем обработчики
    socket.on('message:get', getMessages)
    socket.on('message:add', addMessage)
    socket.on('message:remove', removeMessage)
}


