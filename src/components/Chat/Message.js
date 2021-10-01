import './Message.style.scss'

export default function Message({ message }) {
	const formatDate = date => {
		const serverDate = new Date(date)
		if (serverDate.toLocaleDateString('en-US') === new Date().toLocaleDateString('en-US')) {
			return serverDate.toTimeString().split(' ')[0].substr(0, 5)
		} else {
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
