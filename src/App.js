import './App.style.scss'
import Chat from './components/Chat'
import Layout from './components/Layout'
import Login from './components/Login'
import useCall from './hooks/useCall'
import useChat from './hooks/useChat'

function App() {
	const url = process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : 'https://my-video-chat-app-server.herokuapp.com/'
	const { isChatReady, messages, sendMessage, logout, setUsername, usersOnline, socket } = useChat(url)
	const { handleCall, emitingStream, receivingStream, incomingStream } = useCall(socket)

	return (
		<div className="App">
			<Layout>
				{isChatReady ? (
					<Chat
						messages={messages}
						sendMessage={sendMessage}
						handleLogout={logout}
						usersOnline={usersOnline}
						handleCall={handleCall}
						emitingStream={emitingStream}
						incomingStream={incomingStream}
						receivingStream={receivingStream}
					/>
				) : (
					<Login setName={setUsername} />
				)}
			</Layout>
		</div>
	)
}

export default App
