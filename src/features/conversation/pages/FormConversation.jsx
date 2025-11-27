import { Plane, Loader2 } from "lucide-react";
import { useStoreConvo } from "../../../shared/components/store/convoStore";
import { useConvo, useFormSession, useKeyPoint } from "../hooks/useFormConvo";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { conversationSchema } from "../utils/validation";
import { useState, useEffect } from "react";
import Markdown from "react-markdown";
import TripSummary from "../components/TripSummary";
import { useQueryClient } from "@tanstack/react-query";
import { usePushMessage } from "../../../shared/hooks/useAiAssistant";
export const FormConversation = () => {
  const {
    messages,
    setConversationAi: setConversationAi,
    addMessage: addMessage,
    setMessages,
  } = useStoreConvo();
  const conversationAi = useStoreConvo((state) => state.conversations);
  const { mutateAsync: startSession } = useFormSession();
  const { mutateAsync: submitConvo, isPending } = useConvo();
  const [hasSessionId, setHasSessionId] = useState(Boolean(localStorage.getItem("sessionId")));
  const [sessionId, setSessionId] = useState(localStorage.getItem("sessionId") || null);
  const {
    data: keyPointList,
    isPending: isPendingKeyPoint,
    refetch: refetchKeyPoint,
  } = useKeyPoint({ enabled: !!sessionId, sessionId });
  const [keyPoint, setKeyPoint] = useState(keyPointList || []);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const handleTabClick = (idx) => setActiveTabIndex(idx);
  const queryClient = useQueryClient();
  const currentTab = keyPoint?.[activeTabIndex];
  const {
    mutate: pushMessage,
    data: summaryResult = [],
    isPending: isPendingSummary,
  } = usePushMessage();

  useEffect(() => {
    if (keyPointList) {
      const summaryIndex = keyPointList.findIndex((item) => item.title === "Summary");
      if (summaryIndex > 0) {
        const summaryItem = keyPointList[summaryIndex];
        const newList = [
          summaryItem,
          ...keyPointList.slice(0, summaryIndex),
          ...keyPointList.slice(summaryIndex + 1),
        ];
        setKeyPoint(newList);
      } else {
        setKeyPoint(keyPointList);
      }
    }
  }, [keyPointList]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(conversationSchema),
    mode: "onChange",
    defaultValues: {
      from: "",
      to: "",
      when: "",
      duration: "",
      transportation: "",
      preference: "",
      numberOfPeople: "",
      estimatedBudget: "",
    },
  });

  const onSubmit = async (data) => {
    console.log(data);
    const session = await startSession();
    localStorage.setItem("sessionId", session?.sessionId);
    setHasSessionId(Boolean(session?.sessionId));
    setSessionId(session?.sessionId || null);
    setConversationAi(true);
    addMessage({ role: "user", text: `hai`, id: Date.now().toString(), author: "user" });
    addMessage({ role: "loading", text: "...", id: "loading", author: "model" });

    await handlePushConvo(data);
    reset();
  };

  const handlePushConvo = async (data) => {
    const sessionId = localStorage.getItem("sessionId");
    const response = await submitConvo({ data, sessionId });
    console.log("response from handlepushconvo", response);
    await queryClient.invalidateQueries({
      queryKey: ["eachConversation", sessionId],
    });

    setMessages([
      { role: "user", text: `hai`, id: Date.now().toString(), author: "user" },
      { role: "model", text: response, id: Date.now().toString(), author: "model" },
    ]);
  };

  useEffect(() => {
    const onSessionIdChanged = (evt) => {
      const sid = localStorage.getItem("sessionId");
      setHasSessionId(Boolean(sid));
      setSessionId(sid || null);
    };
    window.addEventListener("sessionId:changed", onSessionIdChanged);
    return () => window.removeEventListener("sessionId:changed", onSessionIdChanged);
  }, [refetchKeyPoint]);

  useEffect(() => {
    if (sessionId) {
      refetchKeyPoint();
    }
  }, [sessionId, refetchKeyPoint]);

  useEffect(() => {
    if (isPendingSummary || !summaryResult) return;

    const getText = (item) => item?.text || item?.message || item?.plainText || "";
    const nextText = Array.isArray(summaryResult)
      ? getText(summaryResult[summaryResult.length - 1])
      : getText(summaryResult);

    if (!nextText) return;

    addMessage({ role: "model", text: nextText, id: Date.now().toString(), author: "model" });
  }, [isPendingSummary, summaryResult, addMessage]);

  const handleClickSummary = () => {
    if (!hasSessionId || !sessionId || isPendingSummary) return;
    const summaryPrompt = "please summarize the whole conversation";
    addMessage({
      role: "user",
      text: summaryPrompt,
      id: Date.now().toString(),
      author: "user",
    });
    addMessage({ role: "loading", text: "...", id: "loading", author: "model" });
    pushMessage(summaryPrompt);
  };

  return (
    <>
      {!isPending && !conversationAi && (
        <div
          className="relative w-full mx-auto p-6 bg-card rounded-lg shadow h-screen"
          aria-busy={isPending}
        >
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2 text-primary">
              <div className="flex items-center gap-2 justify-center">
                <Plane className="h-6 w-6 text-primary" />
                Let's Plan Your Perfect Getaway
              </div>
            </h2>
            <p className="text-muted-foreground mb-6">
              Please fill out the form below with your desired trip details. <br />
              The more information you provide, the better travel plan we can create for you!
            </p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1 text-muted-foreground">From</label>
                <input
                  type="text"
                  {...register("from")}
                  placeholder="Jakarta"
                  className="w-full rounded-md border border-border p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.from && <p className="mt-1 text-sm text-red-600">{errors.from.message}</p>}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1 text-muted-foreground">To</label>
                <input
                  type="text"
                  {...register("to")}
                  placeholder="the most beautiful place in Tokyo"
                  className="w-full rounded-md border border-border p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.to && <p className="mt-1 text-sm text-red-600">{errors.to.message}</p>}
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1 text-muted-foreground">When</label>
                <input
                  type="text"
                  {...register("when")}
                  placeholder="around November next year"
                  className="w-full rounded-md border border-border p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.when && <p className="mt-1 text-sm text-red-600">{errors.when.message}</p>}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1 text-muted-foreground">
                  Duration
                </label>
                <input
                  type="text"
                  {...register("duration")}
                  placeholder="7 days"
                  className="w-full rounded-md border border-border p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.duration && (
                  <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>
                )}
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1 text-muted-foreground">
                  Holiday Preference
                </label>
                <input
                  type="text"
                  {...register("preference")}
                  placeholder="sea and land tourism"
                  className="w-full rounded-md border border-border p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.preference && (
                  <p className="mt-1 text-sm text-red-600">{errors.preference.message}</p>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1 text-muted-foreground">
                  Number of People
                </label>
                <input
                  type="text"
                  {...register("numberOfPeople")}
                  placeholder="just me"
                  className="w-full rounded-md border border-border p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.numberOfPeople && (
                  <p className="mt-1 text-sm text-red-600">{errors.numberOfPeople.message}</p>
                )}
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1 text-muted-foreground">
                  Transportation
                </label>
                <input
                  type="text"
                  {...register("transportation")}
                  placeholder="any land vehicle"
                  className="w-full rounded-md border border-border p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.transportation && (
                  <p className="mt-1 text-sm text-red-600">{errors.transportation.message}</p>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1 text-muted-foreground">
                  Estimated Budget
                </label>
                <input
                  type="text"
                  {...register("estimatedBudget")}
                  placeholder="10000000"
                  className="w-full rounded-md border border-border p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.estimatedBudget && (
                  <p className="mt-1 text-sm text-red-600">{errors.estimatedBudget.message}</p>
                )}
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 py-2 rounded-md bg-primary hover:bg-primary/90 hover:cursor-pointer disabled:opacity-60 text-primary-foreground font-semibold transition"
            >
              Submit
            </button>
          </form>
        </div>
      )}

      {conversationAi && hasSessionId && keyPointList?.length <= 0 && (
        <div className="flex flex-col items-center justify-center min-h-screen text-center mx-auto">
          {/* Animasi Icon/Spinner */}
          <div className="relative flex h-16 w-16 mb-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-20"></span>
            <span className="relative inline-flex rounded-full h-16 w-16 bg-gradient-to-tr from-blue-500 to-primary items-center justify-center shadow-lg">
              <svg
                className="w-8 h-8 text-white animate-pulse"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                />
              </svg>
            </span>
          </div>

          <h3 className="text-xl font-bold text-gray-800 tracking-wide">
            Orchestrating Your Journey Plans
          </h3>

          <p className="text-gray-500 text-sm mt-2 animate-pulse font-medium">
            Keep the conversation flowing with your preferences!
          </p>
        </div>
      )}
      {/* penanda saat belum ada sessionId meski conversationAi aktif */}
      {conversationAi && !hasSessionId && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-md bg-card shadow w-full mt-2"
          role="status"
          aria-live="polite"
        >
          <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden="true" />
          <span className="text-sm text-muted-foreground">Menyiapkan sesi AI...</span>
        </div>
      )}

      {/* loading saat keyPoint sedang diambil setelah ada sessionId */}
      {conversationAi && hasSessionId && isPendingKeyPoint && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-md bg-card shadow w-full mt-2"
          role="status"
          aria-live="polite"
        >
          <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden="true" />
          <span className="text-sm text-muted-foreground">Mengambil rekomendasi AI...</span>
        </div>
      )}

      {!isPending && !isPendingKeyPoint && conversationAi && hasSessionId && (
        <>
          <div className="mt-1 h-full min-h-0 flex flex-col overflow-x-auto w-full  min-w-0">
            <div className="flex bg-sidebar-background flex-wrap gap-2 border-sidebar-border shrink-0 max-w-full border-b">
              {keyPoint?.map((tab, idx) => (
                <button
                  key={tab.title}
                  type="button"
                  onClick={() => handleTabClick(idx)}
                  className={`flex items-center gap-2 px-4 py-2  transition-colors text-sm
                                        ${
                                          activeTabIndex === idx
                                            ? "border-b-2 border-primary text-primary bg-white"
                                            : "text-muted-foreground hover:text-foreground"
                                        }`}
                >
                  {tab.title}
                </button>
              ))}
            </div>
            {/* 
            <div className="relative mt-4 p-4 rounded-md bg-card overflow-y-auto min-h-0 flex-1 scroll-smooth">
              {(() => {
                if (!keyPoint || !keyPoint[activeTabIndex]) return null;
                const tab = keyPoint[activeTabIndex];
                if (tab.title === "Summary") {
                  try {
                    const summary = JSON.parse(tab.detail);
                    return <TripSummary summaryData={summary.details} />;
                  } catch (error) {
                    return <Markdown>{tab.detail}</Markdown>;
                  }
                } else {
                  return (
                    <>
                      <h2 className="text-2xl font-bold text-gray-800 mb-4">{tab.title}</h2>
                      <div className="text-sm text-foreground whitespace-pre-line">
                        <Markdown>{tab.detail}</Markdown>
                      </div>
                      <div className="absolute right-4 bottom-4">
                        <button
                          type="button"
                          className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition"
                        >
                          Summary
                        </button>
                      </div>
                    </>
                  );
                }
              })()}
            </div> */}
            <div className="relative mt-4 min-h-0 flex-1">
              {/* scrollable content */}
              <div className="p-4 rounded-md bg-card overflow-y-auto min-h-0 h-full scroll-smooth">
                {(() => {
                  if (!keyPoint || !keyPoint[activeTabIndex]) return null;
                  const tab = keyPoint[activeTabIndex];

                  if (tab.title === "Summary") {
                    try {
                      const summary = JSON.parse(tab.detail);
                      return <TripSummary summaryData={summary.details} />;
                    } catch {
                      return <Markdown>{tab.detail}</Markdown>;
                    }
                  }

                  return (
                    <>
                      <h2 className="text-2xl font-bold text-gray-800 mb-4">{tab.title}</h2>
                      <div className="text-sm text-foreground whitespace-pre-line">
                        <Markdown>{tab.detail}</Markdown>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* floating overlay button */}
              {currentTab && currentTab.title !== "Summary" && (
                <button
                  type="button"
                  onClick={handleClickSummary}
                  disabled={isPendingSummary}
                  className="absolute right-4 bottom-4 z-20 inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition disabled:opacity-60"
                >
                  Summary
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};
