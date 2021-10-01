import './MiniChat.style.scss'

export default function MiniChat({ lastMessages }) {
	return (
		<div className="mini-chat">
			{lastMessages.map(msg => (
				<div key={msg.id} className="mini-message">
					{msg.self ? 'Вы' : msg.username}: {msg.text}
				</div>
			))}
		</div>
	)
}
