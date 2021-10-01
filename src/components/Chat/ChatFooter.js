import { useState } from 'react'
import './ChatFooter.style.scss'
import { ReactComponent as SendIcon } from '../../icons/send-icon.svg'

export default function ChatFooter({ sendMessage }) {
	const [text, setText] = useState('')

	const submit = e => {
		// console.log('submit')
		e.preventDefault()
		if (text.trim()) {
			// console.log(text.trim())
			// console.log(e)
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
