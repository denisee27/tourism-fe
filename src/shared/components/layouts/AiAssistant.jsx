import { Send, SendHorizontal, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useEachConversation, usePushMessage } from "../../hooks/useAiAssistant";
import { useLocalStorageRefetch } from "../../hooks/useLocalStorageRefetch";

export const AiAssistant = () => {
    const [sessionId, setSessionId] = useState(localStorage.getItem("sessionId"));
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState("");
    const { data: eachData = null, refetch, isRefetching, isPending, isError } = useEachConversation(sessionId);
    const { mutate: pushMessage, data: resultConvo = [], isPending: isPendingPush, isError: isErrorPush } = usePushMessage();
    // Pesan dari server (eachData) saja, untuk mendeteksi perubahan
    const eachMessages = useMemo(() => (
        Array.isArray(eachData) ? eachData : (eachData?.messages || [])
    ), [eachData]);

    // Ref ke kontainer & kontrol auto-scroll agar tidak mengganggu scroll manual
    const eachContainerRef = useRef(null);
    const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
    const prevEachLenRef = useRef(0);

    // Util throttle & debounce ringan
    const throttle = (fn, wait = 100) => {
        let last = 0;
        return (...args) => {
            const now = Date.now();
            if (now - last >= wait) {
                last = now;
                fn(...args);
            }
        };
    };
    const debounce = (fn, delay = 120) => {
        let t;
        return (...args) => {
            clearTimeout(t);
            t = setTimeout(() => fn(...args), delay);
        };
    };

    // Animasi scroll yang smooth
    const animateScroll = (container, targetTop, durationMs = 300) => {
        try {
            const startTop = container.scrollTop;
            const distance = targetTop - startTop;
            const startTime = performance.now();
            const easeInOutQuad = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);
            const step = (now) => {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / durationMs, 1);
                const eased = easeInOutQuad(progress);
                container.scrollTop = startTop + distance * eased;
                if (progress < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        } catch (err) {
            // Fallback tanpa animasi
            if (container) container.scrollTop = targetTop;
        }
    };
    useEffect(() => {
        if (!sessionId) return;
        refetch();
    }, [sessionId, refetch]);

    const safeScrollToBottom = () => {
        const container = eachContainerRef.current;
        if (!container) return;
        const hasOverflow = container.scrollHeight > container.clientHeight;
        if (!hasOverflow) return;
        const target = Math.max(container.scrollHeight - container.clientHeight, 0);
        animateScroll(container, target, 300);
    };

    const debouncedScrollToBottom = useMemo(() => debounce(safeScrollToBottom, 150), [eachMessages.length]);

    const handlePushMessage = (e) => {
        e.preventDefault();
        setMessages(state => [...state, { role: "user", text: inputMessage }]);
        pushMessage(inputMessage);
        setInputMessage("")
    }

    useEffect(() => {
        if (isPendingPush) return;
        if (!resultConvo) return;

        const getText = (item) => item?.text || item?.message || item?.plainText || "";
        const nextText = Array.isArray(resultConvo)
            ? getText(resultConvo[resultConvo.length - 1])
            : getText(resultConvo);

        if (!nextText) {
            console.log("pushMessage result has no text field", resultConvo);
            return;
        }

        setMessages((state) => [...state, { role: "model", text: nextText }]);
    }, [isPendingPush, resultConvo]);

    useEffect(() => {
        if (isPending) return;
        const container = eachContainerRef.current;
        if (!container) return;
        const hasOverflow = container.scrollHeight > container.clientHeight;

        const prevLen = prevEachLenRef.current;
        const currLen = eachMessages.length;
        const added = currLen > prevLen;
        prevEachLenRef.current = currLen;

        if ((prevLen === 0 && currLen > 0) || added) {
            if (autoScrollEnabled && hasOverflow) {
                debouncedScrollToBottom();
            }
        }
    }, [eachMessages.length, isPending, autoScrollEnabled, debouncedScrollToBottom]);

    // Deteksi interaksi user: disable auto-scroll jika user scroll ke atas
    useEffect(() => {
        const container = eachContainerRef.current;
        if (!container) return;
        const onScroll = throttle(() => {
            const { scrollTop, clientHeight, scrollHeight } = container;
            const atBottom = scrollTop + clientHeight >= scrollHeight - 8;
            setAutoScrollEnabled(atBottom);
        }, 100);
        container.addEventListener("scroll", onScroll);
        return () => container.removeEventListener("scroll", onScroll);
    }, []);

    // Scroll saat resize (edge case)
    useEffect(() => {
        const onResize = throttle(() => {
            if (autoScrollEnabled) safeScrollToBottom();
        }, 200);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, [autoScrollEnabled]);

    // Auto-refetch ketika sessionId di localStorage berubah via custom hook
    useLocalStorageRefetch({
        key: "sessionId",
        queryKeys: [["eachConversation"]],
        onChange: (next) => {
            if (next && next !== sessionId) setSessionId(next);
        },
    });

    return (
        <main className="w-full flex h-screen flex-1 flex-col bg-background border-s border-sidebar-border">
            <header className="flex items-center gap-3 border-b border-sidebar-border p-4">
                <Sparkles className="size-6 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">AI Assistant</h2>
            </header>
            {/* section conversation */}
            <div
                id="eachData-container"
                ref={eachContainerRef}
                className="flex-1 space-y-6 overflow-x-auto overflow-y-auto p-6 scroll-smooth overscroll-contain"
            >
                {isPending || isRefetching ? <div>Loading...</div> : (
                    ([
                        ...((Array.isArray(eachData) ? eachData : (eachData?.messages || []))),
                        ...messages,
                    ]).map((message, index) => (
                        <div
                            key={index}
                            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"
                                }`}
                        >
                            <div
                                className={`max-w-[85%] rounded-lg px-4 py-3 text-sm leading-relaxed ${message.role === "user"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-foreground"
                                    }`}
                            >
                                <span
                                    className={`${(typeof (message.text || message.message) === 'string' && !(message.text || message.message)?.includes('\n') && (message.text || message.message)?.length > 500)
                                        ? 'truncate'
                                        : 'whitespace-pre-wrap'
                                        } break-words leading-relaxed`}
                                    title={(message.text || message.message) || ''}
                                >
                                    {message.text || message.message}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <footer className="border-t border-sidebar-border p-4">
                <form>
                    <div className="flex items-center gap-2">
                        <textarea
                            name="message"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder="Ask me about your trip"
                            className="flex-1 resize-none rounded-lg border border-input bg-transparent p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                            rows={1}
                        />
                        <button
                            onClick={handlePushMessage}
                            type="submit"
                            className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
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