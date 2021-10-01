import { useEffect, useState } from 'react'

import './index.style.scss'
import { ReactComponent as Speaker } from '../../icons/speaker-icon.svg'
import MiniChat from './MiniChat'

// Проигрыватель видео и мини-чат для режим просмотра
export default function VideoPlayer({ emitingStream, messages }) {
	const [muted, setMuted] = useState(false)
	const [lastMessages, setLastMessages] = useState([])

	// Выдёргиваем три последних сообщения из чата и отображаем в мини-чате только их
	useEffect(() => {
		const tempMsgs = []
		let count = 0
		messages
			// Создаём копию массива
			.slice(0)
			// Разворачиваем порядок элементов в массиве
			.reverse()
			// Проверяем что это именно сообщение, а не уведомление
			.forEach(msg => {
				if (!msg.isNotice && count < 3) {
					count++
					tempMsgs.unshift(msg)
				}
			})
		// Сохраняем результат как состояние
		setLastMessages([...tempMsgs])
	}, [messages])

	return (
		<div className="video-wrapper">
			{/* Для звонящего звук в его же стриме отключен */}
			<video muted={emitingStream ? true : muted} />
			<MiniChat lastMessages={lastMessages} />
			{/* Кнопка для заглушения звука рендеится только для зрителей */}
			{!emitingStream && (
				<button onClick={() => setMuted(!muted)} className={muted ? 'mute toggled' : 'mute'}>
					<Speaker />
				</button>
			)}
		</div>
	)
}
