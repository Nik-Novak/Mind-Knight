import "dotenv/config";

import { database } from "@/database";
import { getClient } from "@/actions/mindnight-session";


console.log('DEBUGGING');

console.log(await database.mindnightSession.findMany());

let client = await getClient();
console.log(client);
