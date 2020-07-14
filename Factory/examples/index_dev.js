const LoggerFactory = require('./logger')

// Development
process.env.NODE_ENV = 'development'

const logger = LoggerFactory.create()

logger.debug('debug')
logger.info('info')
logger.warn('warn')
logger.error('error')
