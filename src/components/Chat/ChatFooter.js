import { useState } from 'react'

import './ChatFooter.style.scss'
import { ReactComponent as SendIcon } from '../../icons/send-icon.svg'

// Нижняя панель чата с инпутом и кнопкой для отправки сообщений
export default function ChatFooter({ sendMessage }) {
	const [text, setText] = useState('')

	// Обработчик отправки сообщений
	const submit = e => {
		e.preventDefault()
		if (text.trim()) {
			sendMessage(text.trim())
			setText('')
		}
	}

	return (
		<form className="chat-footer" onSubmit={submit}>
			<input type="text" onChange={e => setText(e.target.value)} value={text} placeholder="Введите ваше сообщение..." />
			<button type="submit">
				<SendIcon />
			</button>
		</form>
	)
}
