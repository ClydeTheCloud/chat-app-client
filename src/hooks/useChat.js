import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import io from 'socket.io-client'
import { ACTIONS } from '../utils/actions'

export default function useChat(url) {
	// Инициализируем состояния
	const [name, setName] = useState('')
	const [messages, setMessages] = useState([])
	const [usersOnline, setUsersOnline] = useState([])
	// Получаем id комнаты из URL
	const { room } = useParams()
	// Инициализируем референс для сокета с целью сохранения подключения между ре-рендерами компонента
	const socket = useRef()

	// Функция инициализации старых сообщений, отправленных до входа пользователя в комнату
	const initMessages = msgs => {
		console.log('init messages')
		setMessages(currentState => [...currentState, ...msgs])
		const messagesEl = document.querySelector('.messages')
		scrollMessageWindowDown(messagesEl)
	}

	// Функция для обработки новых сообщений
	const updateMessages = msgObj => {
		console.log('update messages')
		// Находим элемент-обёртку для  сообщений
		const messagesEl = document.querySelector('.messages')

		// Определяем позицию скролла пользователя в элементе-обёртки
		// Если элемент прокручен до конца, то позже*, при добавлении нового сообщения, мы прокрутим скролл вниз, чтоб новое сообщение не выпало из зоны видимости
		// Если элемент не прокручен до конца, вероятно пользователь читает старые сообщения, поэтому скролл не трогаем
		let isMessagesScrolledToBottom
		if (messagesEl) {
			isMessagesScrolledToBottom = messagesEl.scrollTop === messagesEl.scrollHeight - messagesEl.offsetHeight
		}

		// Если новое сообщение отправлено самим пользователем, делаем соответствующую отметку на объекте сообщения
		if (msgObj.userId === socket.current.id) {
			msgObj.self = true
		}

		// Обновляем состояние (массив всех сообщений) через коллбэк
		setMessages(currentState => [...currentState, msgObj])

		// *то самое "позже"
		if (isMessagesScrolledToBottom) {
			scrollMessageWindowDown(messagesEl)
		}
	}

	// Функция для прокрутки
	const scrollMessageWindowDown = messagesEl => {
		messagesEl = document.querySelector('.messages')
		if (messagesEl) {
			messagesEl.scrollTop = messagesEl.scrollHeight
		}
	}

	// Подключаемся к сокету и назначаем все обработчики событий
	useEffect(() => {
		// Если переменная состояния имеет значение, значит мы готовы к подключению
		if (name) {
			// Дбавляем в запрос подключения id комнаты и имя пользователя
			socket.current = io(url, {
				query: { roomId: room, username: name },
			})
			// Получение сообщений или уведомлений
			socket.current.on(ACTIONS.MESSAGE, msg => updateMessages(msg))
			socket.current.on(ACTIONS.NOTICE, notice => updateMessages(notice))
			// События инициализации, для получения сообщений, отправленых до входа пользователя в комнату
			socket.current.on(ACTIONS.INIT_MESSAGES, msgs => initMessages(msgs))
			socket.current.emit(ACTIONS.GET_MESSAGES)
			// Событие для оповещения остальных сокетов о новом подключении
			socket.current.emit(ACTIONS.CONNECTION_ESTABLISHED)

			// Событие для обновления списка пользователей, находящихся онлайн
			socket.current.on(ACTIONS.USERS, users => setUsersOnline(users))

			// События для отображения статуса подключения к серверу в хэдере чата (круглый индикатор рядом с названием комнаты)
			socket.current.on(ACTIONS.CONNECT, () => {
				const roomOnline = document.querySelector('.dot')
				roomOnline.style.backgroundColor = 'var(--green)'
			})
			socket.current.on(ACTIONS.DISCONNECT, () => {
				const roomOnline = document.querySelector('.dot')
				if (roomOnline) {
					roomOnline.style.backgroundColor = 'var(--red)'
				}
			})

			return () => {
				socket.current.disconnect()
			}
		}
		// eslint-disable-next-line
	}, [name])

	const sendMessage = text => {
		socket.current.emit(ACTIONS.ADD_MESSAGE, text)
	}

	const logout = () => {
		setName(undefined)
	}

	return {
		isChatReady: !!name,
		sendMessage,
		logout,
		messages,
		usersOnline,
		setUsername: setName,
		socket,
	}
}
