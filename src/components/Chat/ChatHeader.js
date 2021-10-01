import { useParams } from 'react-router-dom'

import './ChatHeader.style.scss'
import { ReactComponent as CallIcon } from '../../icons/call-icon.svg'

export default function ChatHeader({ handleLogout, toggleSidebar, handleCall, incomingStream }) {
	const { room } = useParams()

	return (
		<div className="chat-header">
			<button className="online" onClick={toggleSidebar}>
				Кто онлайн?
			</button>
			<div className="room">
				<div className="dot" />
				{room}
				<button onClick={handleCall} className={incomingStream ? 'call-button calling' : 'call-button'}>
					<CallIcon />
				</button>
			</div>
			<button onClick={handleLogout} className="logout">
				Выйти
			</button>
		</div>
	)
}
