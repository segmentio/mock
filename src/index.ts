import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as errorhandler from 'errorhandler'
import { api } from './api'
import { getPort } from './port'
import * as cors from 'cors'

// Express configuration
const app = express()
app.set('port', getPort())
app.use(bodyParser.text()) // analytics.js submits requests as plain-text.
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(errorhandler())

// Enable all CORS requests; analytics.js users will
// need to make requests from other localhost domains.
app.use(cors())

// Attach Express routes
app.use('/health', (_, res) => {
	res.sendStatus(200)
})
app.use('/', api)
app.use((req, res) => {
	console.log(`Unsupported request received: ${req.path}`)
	res.sendStatus(404)
})

const server = app.listen(app.get('port'), () => {
	console.log('App is running at http://localhost:%d in %s mode', app.get('port'), app.get('env'))
	console.log('Press CTRL-C to stop')
})

export default server
