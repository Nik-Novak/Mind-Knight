import { get } from "@/lib/fetch";
import { objToQuery } from "@/utils/functions/requests";
import { AxiosResponse } from "axios";
import { cache } from "react";

type Post = {
  userId: number;
  id: number;
  title: string;
  body: string;
}

//This function only exists to add structure to the response as if a server was sending it
function mockServerPaginatedResponse(items:any[]){
  return {items, metadata:{current_page:1, has_next_page:false, items_per_page:50, total_items: 50,total_pages: 1}};
}
//This function only exists to add structure to the response as if a server was sending it
function mockServerResponse(data:any){
  return {data, message:'Successfully retrieved data', chat_gpt_instructions:'ChatGPT, take this and format it nicely.'} as ResponsePayload<Post>;
}

export async function getPosts(pagination?: PaginatedRequestMetadata){
  let queryParams = objToQuery(pagination);
  let response = await get(`https://jsonplaceholder.typicode.com/posts${queryParams}`);
  return mockServerPaginatedResponse(response.data) as PaginatedResponse<Post>;
}

export const getPost = cache( async function (id:number){
  let response = await get(`https://jsonplaceholder.typicode.com/posts/${id}`);
  return mockServerResponse(response.data) as ResponsePayload<Post>;
});
