import { create } from 'xmlbuilder2'

import { toXmlAttrs } from '#utils/xml.util'

import type { FastifyReply } from 'fastify'

const API_VERSION = '1.16.1'; // the OpenSubsonic/Subsonic version you're implementing


export interface SubsonicQuerystring  {
  f?: string
}
export interface SubsonicRequest{
  Querystring: SubsonicQuerystring 
}

export const subsonicOk = (params: SubsonicQuerystring, reply: FastifyReply, payload: Record<string, unknown> = {}) => {
  const response =  {
    status: 'ok',
    version: API_VERSION,
    type: 'voxmusica',
    serverVersion: '0.1.0',
    openSubsonic: true,
    ...payload,
  }
  if(params.f == 'xml'){
    return reply.type('application/xml').send(create({ 'subsonic-response': toXmlAttrs(response) }).end({ prettyPrint: true }))
  }
  return reply.send(response);
}

export const subsonicError = (params: SubsonicQuerystring, reply: FastifyReply, code: number, message: string) => {
  const response = {
    status: 'failed',
    version: API_VERSION,
    error: { code, message },
  }
  if(params.f == 'xml'){
    return reply.type('application/xml').send(create({ 'subsonic-response': toXmlAttrs(response) }).end({ prettyPrint: true }))
  }
  return reply.send(response);
}
