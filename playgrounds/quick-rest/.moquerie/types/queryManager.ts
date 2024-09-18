import { QueryManager } from "moquerie";
import { Message, MyObject, User } from "./resources.js";

declare module "moquerie" {
    export interface QueryManagerProxy {
        Message: QueryManager<Message>;
        MyObject: QueryManager<MyObject>;
        User: QueryManager<User>;
    }
}