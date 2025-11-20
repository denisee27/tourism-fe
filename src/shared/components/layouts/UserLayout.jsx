import { FormConversation } from "../../../features/conversation/pages/FormConversation";
import { AiAssistant } from "./AiAssistant";
import { Sidebar } from "./Sidebar";

export const UserLayout = () => {
  return (
    <div className="flex h-screen bg-background flex-col md:flex-row">
      <Sidebar />
      <div className="min-w-0 min-h-0 flex-1 flex flex-col md:basis-[65%] lg:basis-[70%] xl:basis-[72%] 2xl:basis-[75%]">
        <FormConversation />
      </div>
      <div className="min-w-0 min-h-0 flex-1 flex flex-col md:basis-[35%] lg:basis-[30%] xl:basis-[28%] 2xl:basis-[25%]">
        <AiAssistant />
      </div>
    </div>
  );
};
