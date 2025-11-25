import { Send, SendHorizontal, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useEachConversation, usePushMessage } from "../../hooks/useAiAssistant";
import { useLocalStorageRefetch } from "../../hooks/useLocalStorageRefetch";
import Markdown from "react-markdown";
import { SyncLoader } from "react-spinners";
import { useStoreConvo } from "../store/convoStore";

export const AiAssistant = () => {
    const [sessionId, setSessionId] = useState(localStorage.getItem("sessionId"));
    const { data: eachData, isPending: isPendingFetch, isRefetching, isError } = useEachConversation(sessionId);
    const { messages, addMessage, setMessages } = useStoreConvo();
    const [inputMessage, setInputMessage] = useState("");
    const { mutate: pushMessage, data: resultConvo = [], isPending: isPendingPush } = usePushMessage();
    const textareaRef = useRef(null);
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);


    useEffect(() => {
        const handleSessionChange = () => {
            if (eachData && !isRefetching && messages.length === 0) {
                const historyMessages = Array.isArray(eachData) ? eachData : (eachData?.messages || []);
                setMessages(historyMessages);
            }
        };
        handleSessionChange();
    }, [eachData, isRefetching, setMessages, messages.length]);

    const throttle = (func, limit) => {
        let inThrottle;
        return function () {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }

    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = container;
            const atBottom = scrollHeight - scrollTop - clientHeight < 50;
            setAutoScrollEnabled(atBottom);
        };

        const throttledHandleScroll = throttle(handleScroll, 100);
        container.addEventListener("scroll", throttledHandleScroll);

        return () => {
            container.removeEventListener("scroll", throttledHandleScroll);
        };
    }, []);

    useEffect(() => {
        if (autoScrollEnabled) {
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
        }
    }, [messages, autoScrollEnabled]);

    const debounce = (fn, delay) => {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn.apply(this, args), delay);
        };
    };

    const handlePushLogic = useCallback((message) => {
        addMessage({ role: "user", text: message, id: Date.now().toString(), author: "user" });
        addMessage({ role: "loading", text: "...", id: "loading", author: "model" });
        pushMessage(message);
        setInputMessage("");
        textareaRef.current?.focus();
    }, [addMessage, pushMessage]);

    const debouncedPush = useMemo(() => debounce(handlePushLogic, 200), [handlePushLogic]);

    const handlePushMessage = (e) => {
        e.preventDefault();
        const trimmedMessage = inputMessage.trim();
        if (!trimmedMessage || isPendingPush) {
            return;
        }
        setAutoScrollEnabled(true);
        debouncedPush(trimmedMessage);
    };

    useEffect(() => {
        if (isPendingPush || !resultConvo) return;

        const getText = (item) => item?.text || item?.message || item?.plainText || "";
        const nextText = Array.isArray(resultConvo)
            ? getText(resultConvo[resultConvo.length - 1])
            : getText(resultConvo);

        if (!nextText) {
            return;
        }

        addMessage({ role: "model", text: nextText, id: Date.now().toString(), author: "model" });
    }, [isPendingPush, resultConvo, addMessage]);


    useLocalStorageRefetch({
        key: "sessionId",
        queryKeys: [["eachConversation"]],
        onChange: (next) => {
            if (next && next !== sessionId) {
                setMessages([]);
                setSessionId(next);
            }
        },
    });

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handlePushMessage(e);
        }
    };

    return (
        <main className="w-full flex h-screen flex-1 flex-col bg-background border-s border-sidebar-border">
            <header className="flex items-center gap-3 border-b border-sidebar-border p-4">
                <Sparkles className="size-6 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">AI Assistant</h2>
            </header>
            <div
                id="messages-container"
                ref={messagesContainerRef}
                className="flex-1 space-y-6 overflow-x-auto overflow-y-auto p-6 scroll-smooth overscroll-contain"
            >
                {isPendingFetch || isRefetching ? (
                    <div className="flex justify-center items-center h-full">
                        <SyncLoader size={10} color="#184e96" />
                    </div>
                ) : isError ? (
                    <div className="flex justify-center items-center h-full">
                        <p className="text-red-500">Error loading conversation. Please try refreshing the page.</p>
                    </div>
                ) : (
                    messages.map((message, index) => (
                        index !== 0 && message.text !== null ?
                            <div key={message.id || index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div
                                    className={`max-w-[85%] rounded-lg px-4 py-3 text-sm leading-relaxed ${message.role === "user"
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-foreground"
                                        }`}
                                >
                                    <span
                                        className={`${(typeof (message.text) === 'string' && !message.text?.includes('\n') && message.text?.length > 500)
                                            ? 'truncate'
                                            : 'whitespace-pre-wrap'
                                            } break-words leading-relaxed`}
                                        title={message.text || ''}
                                    >
                                        {message.role === "loading" ? (
                                            <div className="h-2 justify-center items-center flex px-2 py-1">
                                                <SyncLoader size={6} color="#184e96" />
                                            </div>
                                        )
                                            : (
                                                <Markdown>{message.text}</Markdown>
                                            )}
                                    </span>
                                </div>
                            </div> : null
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            <footer className="border-t border-sidebar-border p-4">
                <form onSubmit={handlePushMessage}>
                    <div className="flex items-center gap-2">
                        <textarea
                            ref={textareaRef}
                            name="message"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder="Ask me about your trip"
                            className="flex-1 resize-none rounded-lg border border-input bg-transparent p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                            rows={1}
                            onKeyDown={handleKeyDown}
                            disabled={isPendingPush}
                        />
                        <button
                            type="submit"
                            disabled={isPendingPush || !inputMessage.trim()}
                            className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                        >
                            <Send className="size-5" />
                            <span className="sr-only">Send</span>
                        </button>
                    </div>
                </form>
            </footer>
        </main>
    );
}