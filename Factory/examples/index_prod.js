const LoggerFactory = require('./logger')

// Production
process.env.NODE_ENV = 'production'

const logger = LoggerFactory.create()

logger.debug('debug')
logger.info('info')
logger.warn('warn')
logger.error('error')
