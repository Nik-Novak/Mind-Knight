type ResponsePayload<T> = {
  chat_gpt_instructions?:string,
  message: string,
  data:T
}