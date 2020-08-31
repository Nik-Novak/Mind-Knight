//@ts-check
import axios from 'axios'

export class Requester {
  constructor(baseURL){
    this.baseURL = baseURL;
  }
  GET = (resourcePath, body)=>{
    let defaultOptions = { baseURL:this.baseURL, data:body };
    return axios.get(resourcePath, defaultOptions );
  }
  POST = (resourcePath, body=undefined)=>{
    let defaultOptions = { baseURL:this.baseURL };
    return axios.post(resourcePath, body, defaultOptions );
  }
}
