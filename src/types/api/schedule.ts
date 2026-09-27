import { TParsedServerContent } from "@/libraries/endpoint/type";

export type TGetScheduleResponse = {
  message: string;
  data: TParsedServerContent[];
};
