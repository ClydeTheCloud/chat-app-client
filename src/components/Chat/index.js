import { useEffect, useState } from 'react'

import ChatFooter from './ChatFooter'
import ChatHeader from './ChatHeader'
import Sidebar from './Sidebar'
import Messages from './Messages'
import VideoPlayer from '../VideoPlayer'
import './index.style.scss'

export default function Chat({
	messages,
	sendMessage,
	handleLogout,
	usersOnline,
	handleCall,
	emitingStream,
	receivingStream,
	incomingStream,
}) {
	const [isSidebarOpen, setIsSidebarOpen] = useState(false)
	// Значение true обозначает что UI в режиме просмотра/вещания видео
	const [videoMode, setVideoMode] = useState(false)
	// Переключатель для панели "кто онлайн"
	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen)
	}

	// Отменяет режим просмотра видео если инициатор звока сбрасывает вызов
	useEffect(() => {
		if (!receivingStream) setVideoMode(false)
	}, [receivingStream])

	return (
		<div className="chat">
			<Sidebar
				usersOnline={usersOnline}
				toggleSidebar={toggleSidebar}
				isSidebarOpen={isSidebarOpen}
				receivingStream={receivingStream}
			/>
			<ChatHeader
				handleLogout={handleLogout}
				toggleSidebar={toggleSidebar}
				handleCall={() => handleCall(setVideoMode)}
				incomingStream={incomingStream}
			/>
			{/* В основном окне чата располагаются либо сообщения, либо окно с видео (у окна с видео так же есть мини-чат) */}
			{videoMode ? <VideoPlayer emitingStream={emitingStream} messages={messages} /> : <Messages messages={messages} />}

			<ChatFooter sendMessage={sendMessage} />
		</div>
	)
}
