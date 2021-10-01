import Peer from 'simple-peer'
import { useEffect, useState, useRef } from 'react'

let log = console.log
let peers = {}

const A = {
	CALL_STATUS: 'call:status',
	CALL_SIGNAL: 'call:signal',
	CALL_READY_TO_JOIN: 'call:ready-to-join',
	CALL_INIT: 'call:init',
	CALL_LEAVE: 'call:leave',
}

export default function useCall(socket) {
	// const [peers, setPeers] = useState({})

	// Булевые состояния, связанные со стримом. Ниже описание что значит значение true в каждом из случаев:
	// Отправляем совй стрим другим
	const [emitingStream, setEmitingStream] = useState(false)
	// Стрим нам отправлен, но мы его ещё не приняли
	const [incomingStream, setIncomingStream] = useState(false)
	// В процессе получаения стороннего стрима
	const [receivingStream, setReceivingStream] = useState(false)

	useEffect(() => log('emitingStream', emitingStream), [emitingStream])
	useEffect(() => log('incomingStream', incomingStream), [incomingStream])
	useEffect(() => log('receivingStream', receivingStream), [receivingStream])

	const streamRef = useRef()

	useEffect(() => {
		if (socket.current) {
			socket.current.on('call:status', status => {
				if (!emitingStream) setIncomingStream(status)
			})
			socket.current.on('call:ended', () => {
				leave()
			})
		}
		// eslint-disable-next-line
	}, [socket.current])

	// Получаем стрим с видео-аудио данными с камеры
	async function getStream() {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: true,
				audio: true,
			})
			streamRef.current = stream
			initVideo(true)
		} catch (error) {
			console.log('Ошибка получения stream объекта', error)
			alert('Ошибка получения stream объекта: ' + error)
		}
	}

	function initVideo(muted) {
		const video = document.querySelector('video')
		video.srcObject = streamRef.current
		video.muted = muted
		video.onloadedmetadata = () => {
			video.play()
		}
	}

	function stopVideo() {
		if (streamRef.current) {
			streamRef.current.getTracks().forEach(track => {
				track.stop()
			})
		}
	}

	// Создаём P2P подключение, отправляем оффер
	function generateOffer(id) {
		log('generate', id)
		console.log(streamRef.current)
		const peer = new Peer({ initiator: true, stream: streamRef.current })
		peer.on('signal', signal => {
			log('initiator sent signal')
			log(signal)
			socket.current.emit('call:signal', { to: id, signal, from: socket.current.id })
		})
		peer.on('connect', () => {
			log('connected')
		})
		return peer
	}

	// Иницируем звонок: назначаем обработчики событий и оповещаем сервер о том что мы готовы принимать вызовы
	function initCall() {
		socket.current.on('call:ready-to-join', id => {
			log('recived ready-to-join')
			peers[id] = generateOffer(id)
		})
		socket.current.on('call:signal', data => {
			log('recieved signal', data)
			peers[data.id].signal(data.signal)
		})
		socket.current.emit('call:init')
	}

	async function startCall() {
		log('start call')
		await getStream()
		setEmitingStream(true)
		initCall()
	}

	// Отвечаем на P2P подключение, отправляем ответ на оффер
	function generateAnswer() {
		const peer = new Peer()
		peers[socket.id] = peer
		log('generating answer')
		let respondTo
		peer.on('signal', signal => {
			log('emiting signal')
			socket.current.emit('call:signal', { to: respondTo, signal, from: socket.current.id })
		})
		peer.on('stream', incomingStream => {
			log('stream')
			streamRef.current = incomingStream
			initVideo(false)
			setReceivingStream(true)
		})
		socket.current.on('call:signal', data => {
			log('recieved signal data', data)

			respondTo = data.id
			peer.signal(data.signal)
		})
		socket.current.emit('call:ready-to-join', socket.current.id)
	}

	function leave() {
		log('leave')
		if (emitingStream) socket.current.emit('call:leave')
		setEmitingStream(false)
		setReceivingStream(false)
		// setStream(null)
		stopVideo()
		streamRef.current = null
		cleanUp()
	}

	function cleanUp() {
		log('cleanup')
		Object.values(peers).forEach(peer => peer.destroy())
		peers = {}
		Object.values(A).forEach(eventName => {
			if (eventName !== 'call:status') {
				socket.current.removeAllListeners(eventName)
			}
		})
	}

	function handleCall(setVideoMode) {
		if (!emitingStream && !incomingStream && !receivingStream) {
			setVideoMode(true)
			startCall()
		} else if (emitingStream || receivingStream) {
			setVideoMode(false)
			leave()
		} else if (incomingStream && !receivingStream) {
			setVideoMode(true)
			generateAnswer()
		}
	}

	return { handleCall, emitingStream, receivingStream, incomingStream }
}
