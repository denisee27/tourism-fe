import { Sidebar } from "./Sidebar";
import { AiAssistant } from "./AiAssistant";
import { Outlet } from "react-router-dom";
import useUIStore from "../../../core/stores/uiStore";
import { useStoreConvo } from "../store/convoStore";

export const MainLayout = () => {
  const conversations = useStoreConvo((state) => state.conversations);
  return (
    <div className="flex h-screen bg-background flex-col md:flex-row">
      <Sidebar />
      <div className="min-w-0 flex-1 md:basis-[65%] lg:basis-[70%] xl:basis-[72%] 2xl:basis-[75%]">
        <Outlet />
      </div>
      {conversations && (
        <div className="min-w-0 flex-1 md:basis-[35%] lg:basis-[30%] xl:basis-[28%] 2xl:basis-[25%]">
          <AiAssistant />
        </div>
      )}
    </div>
  );
};
