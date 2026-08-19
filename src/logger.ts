import  { createLogger, format, transports } from 'winston'

const alignColorsAndTime = format.combine(
    format.colorize({
        all:true
    }),
    format.timestamp({
        format:"YY-MM-DD HH:mm:ss"
    }),
    format.printf(
        ({ level, message, timestamp, ...metadata }) => {
          let msg = `${timestamp}  ${level} : ${message}`
          if(Object.keys(metadata).length > 0){
            msg += ` ${JSON.stringify(metadata)}`
          }
          return msg
        }
    )
);

const logger = createLogger({
  level: process.env.LOG_LEVEL ?? 'info',
  format: format.combine(format.colorize(), alignColorsAndTime),
  transports: [
    new transports.Console()
  ],
})

export { logger }
export default logger
