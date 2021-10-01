import Peer from 'simple-peer'
import { useEffect, useState, useRef } from 'react'

import { ACTIONS } from '../utils/actions'

// В этот объект сохраняются все подключения
let peers = {}

// Список событий сокета, от которых мы отписываемся после отключения видео
const eventCleanUpList = ['call:signal', 'call:ready-to-join', 'call:init']

export default function useCall(socket) {
	// Булевые состояния, связанные со стримом. Ниже описание что значит значение true в каждом из случаев:
	// Отправляем совй стрим другим
	const [emitingStream, setEmitingStream] = useState(false)
	// Стрим нам отправлен, но мы его ещё не приняли
	const [incomingStream, setIncomingStream] = useState(false)
	// В процессе получаения стороннего стрима
	const [receivingStream, setReceivingStream] = useState(false)

	// Реф на объект стрима полученый с нашей камеры, либо через P2P соединение
	const streamRef = useRef()

	// Назначаем обработчики некоторых событий сразу как получили реф на объект сокета
	useEffect(() => {
		if (socket.current) {
			// Меняем локально состояние при смене статуса звонка на сервере
			socket.current.on(ACTIONS.CALL_STATUS, setIncomingStream)
			// Отключаем видео при сигнале от сервера об окончании сеанса
			socket.current.on(ACTIONS.CALL_ENDED, leave)
			// Отправляем запрос на получения статуса звонка
			socket.current.emit(ACTIONS.CALL_STATUS)
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

	// Находим плеер, устанавливаем стрим как источник данных, запускаем воспроизведение. Вызываем функцию с аргументом true если источник стрима локальный, и false, если стрим получен от сервера
	function initVideo(muted) {
		const video = document.querySelector('video')
		video.srcObject = streamRef.current
		video.muted = muted
		video.onloadedmetadata = () => {
			video.play()
		}
	}

	// Останавливаем все дорожки воспроизведения стрима (аудио/видео)
	function stopVideo() {
		if (streamRef.current) {
			streamRef.current.getTracks().forEach(track => {
				track.stop()
			})
		}
	}

	// Создаём P2P подключение со стримом, отправляем оффер
	function generateOffer(id) {
		const peer = new Peer({ initiator: true, stream: streamRef.current })
		peer.on('signal', signal => {
			socket.current.emit(ACTIONS.CALL_SIGNAL, { to: id, signal, from: socket.current.id })
		})
		return peer
	}

	// Иницируем звонок: назначаем обработчики событий и оповещаем сервер о том что мы готовы принимать вызовы
	function initCall() {
		// Когда кто-то готов подключиться - генерируем оффер и отправляем по ID
		socket.current.on(ACTIONS.CALL_READY_TO_JOIN, id => {
			peers[id] = generateOffer(id)
		})
		// Принимаем ответный сигнал для подключения
		socket.current.on(ACTIONS.CALL_SIGNAL, data => {
			peers[data.id].signal(data.signal)
		})
		// Оповещаем сервер начали звонок и готовы к подключениям
		socket.current.emit(ACTIONS.CALL_INIT)
	}

	// Начинаем вызов - получаем медиапоток, обновляем состояние, запускаем механизм инициализации
	async function startCall() {
		await getStream()
		setEmitingStream(true)
		initCall()
	}

	// Отвечаем на P2P подключение, отправляем ответ на оффер
	function generateAnswer() {
		const peer = new Peer()
		peers[socket.id] = peer
		let respondTo
		// При получаении пиром сигнала отправляем ответ
		peer.on('signal', signal => {
			socket.current.emit(ACTIONS.CALL_SIGNAL, { to: respondTo, signal, from: socket.current.id })
		})
		// При получаении медиапотока сохраняем его в реф и инициализируем видео, так же обновляем состояние
		peer.on('stream', incomingStream => {
			streamRef.current = incomingStream
			initVideo(false)
			setReceivingStream(true)
		})
		// При получении сигнала через веб-сокет передаём его пиру для обработки
		socket.current.on(ACTIONS.CALL_SIGNAL, data => {
			respondTo = data.id
			peer.signal(data.signal)
		})
		// Оповещаем сервер что хотели бы подключиться к текущему звонку
		socket.current.emit(ACTIONS.CALL_READY_TO_JOIN, socket.current.id)
	}

	// Отключаемся от звонка, останавливаем воспроизведение, подчищаем хвосты
	function leave() {
		if (emitingStream) socket.current.emit(ACTIONS.CALL_LEAVE)
		setEmitingStream(false)
		setReceivingStream(false)
		// setStream(null)
		stopVideo()
		streamRef.current = null
		cleanUp()
	}

	// Очищаем все пиры с которыми связывались, отписываемся от событий обработки сигналов для соединения пиров
	function cleanUp() {
		Object.values(peers).forEach(peer => peer.destroy())
		peers = {}
		Object.values(eventCleanUpList).forEach(eventName => socket.current.removeAllListeners(eventName))
	}

	// Универсальная функция для управления вызовами одной кнопкой - решает иницировать вызов, принимать его, или сбрасывать.
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
