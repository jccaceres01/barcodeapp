import { Http, Response } from '@nativescript/core'
import config from '../customconfig.json'

const Consumer = {
  constructor() {
    this.url = config.api,
    this.http = Http
    this.response = Response
  },

  get(apiRoute, params = undefined) {
    if (params !== undefined) {

    } else {
      
    }
  }
}

export default Consumer
