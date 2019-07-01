import * as express from 'express'
import { get } from 'got'
import { getPort } from './port'

export const api = express()

interface Message extends Record<string, any> {
	timestamp?: string
	messageId?: string
}

let messages: Message[] = []

// These endpoints are used by analytics.js.
api.post(
	[
		'/v1/t',
		'/v1/track',
		'/v1/i',
		'/v1/identify',
		'/v1/g',
		'/v1/group',
		'/v1/a',
		'/v1/alias',
		'/v1/p',
		'/v1/page',
	],
	(req, res) => {
		if (req.body) {
			const msg = JSON.parse(req.body)
			messages.push(msg)
			console.log(`Received 1 message:`)
			console.log(JSON.stringify(msg, undefined, 4))
		}

		res.sendStatus(200)
	}
)

// These batch endpoints are used by most libraries, including
// analytics-android and analytics-ios.
api.post(['/v1/import', '/v1/batch'], (req, res) => {
	const newMessages = (req.body && req.body.batch) || []
	messages.push(...newMessages)

	console.log(`Received ${newMessages.length} message(s):`)
	console.log(JSON.stringify(newMessages, undefined, 4))

	res.sendStatus(200)
})

// Support fetching Source settings from Segment's CDN.
api.get('/v1/projects/:writeKey/settings', async (req, res) => {
	const writeKey: string = req.params['writeKey']
	console.log(`Received CDN settings request (writeKey=${writeKey})`)

	const { body: settings } = await get(`https://cdn.segment.com/v1/projects/${writeKey}/settings`)
	res.send(settings)
})

api.get('/analytics.js/v1/:writeKey/analytics.min.js', async (req, res) => {
	const writeKey: string = req.params['writeKey']
	console.log(`Received CDN analytics.js request (writeKey=${writeKey})`)

	const { body: ajs } = await get(
		`https://cdn.segment.com/analytics.js/v1/${writeKey}/analytics.min.js`
	)

	// By default, the analytics.js script will send Segment track calls to
	// https://api.segment.io. We can override this with the `apiHost` option
	// during the `.load()` step, however we can't point it to an http endpoint
	// like localhost (for this sidecar). As a workaround, you can point the CDN
	// for the analytics.js snippet to the sidecar and this endpoint will mutate
	// the script to point the Segment integration at this sidecar.
	res.send(ajs.replace('"https://"+this.options.apiHost', `"http://localhost:${getPort()}/v1"`))
})

// This API is how you can fetch the set of analytics calls that were fired.
api.get('/messages', (_, res) => {
	const resp = messages
	messages = []

	res.json(
		resp.map(m => {
			// Remove fields that regularly change. In the future, we
			// may want to validate they look correct before removing
			// them, and insert a placeholder error if they are wrong.
			delete m.timestamp
			delete m.messageId

			return m
		})
	)
})
