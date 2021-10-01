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
	const [videoMode, setVideoMode] = useState(false)
	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen)
	}

	useEffect(() => {
		console.log('useffect on chat')
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
			{videoMode ? <VideoPlayer emitingStream={emitingStream} messages={messages} /> : <Messages messages={messages} />}

			<ChatFooter sendMessage={sendMessage} />
		</div>
	)
}
