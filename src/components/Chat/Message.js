import './Message.style.scss'

// Единичное сообщение в чате
export default function Message({ message }) {
	// Обрабатываем timestamp сообщений, который был создан на сервере
	const formatDate = date => {
		const serverDate = new Date(date)
		// Если сообщение для получателя было отправлено сегодня, то отображаем только часы и минуты
		if (serverDate.toLocaleDateString('en-US') === new Date().toLocaleDateString('en-US')) {
			return serverDate.toTimeString().split(' ')[0].substr(0, 5)
		} else {
			// В другом случае пишем дату и время полностью
			return serverDate.toLocaleDateString('ru-RU')
		}
	}

	return (
		<div className={message.self ? 'message self' : 'message'}>
			<div className="name">{message.self ? 'Вы' : message.username}</div>
			<div className="body">
				<div className="text">{message.text}</div>
				<div className="date">{formatDate(message.date)}</div>
			</div>
		</div>
	)
}
