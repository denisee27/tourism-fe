import { Plane, Loader2 } from "lucide-react";
import { useStoreConvo } from "../../../shared/components/store/convoStore";
import { useConvo, useFormSession, useKeyPoint } from "../hooks/useFormConvo";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { conversationSchema } from "../utils/validation";
import { useState } from "react";
import Markdown from 'react-markdown'




export const FormConversation = () => {
    const setConversationAi = useStoreConvo((state) => state.setConversationAi);
    const conversationAi = useStoreConvo((state) => state.conversations);
    const { mutateAsync: startSession } = useFormSession();
    const { mutateAsync: submitConvo, isPending } = useConvo();
    const { data: keyPointList, isPending: isPendingKeyPoint } = useKeyPoint();
    const [keyPoint, setKeyPoint] = useState(keyPointList || []);
    console.log('keyPointList', keyPointList)

    const [activeTabIndex, setActiveTabIndex] = useState(0);
    const handleTabClick = (idx) => setActiveTabIndex(idx);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
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
        setConversationAi(true);
        const session = await startSession();
        localStorage.setItem("sessionId", session?.sessionId);
        handlePushConvo(data);
    };

    const handlePushConvo = async (data) => {
        const sessionId = localStorage.getItem("sessionId");
        const res = await submitConvo({ data, sessionId });
        console.log(res);
    }

    return (
        <>
            {(!isPending && !isPendingKeyPoint && conversationAi) && (
                <>
                    <div className="mt-1 w-full max-w-full">
                        <div className="flex flex-wrap gap-2 border-b border-sidebar-border pb-2">
                            {keyPointList.map((tab, idx) => (
                                <button
                                    key={tab.title}
                                    type="button"
                                    onClick={() => handleTabClick(idx)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-t-md transition-colors text-sm
                                        ${activeTabIndex === idx
                                            ? "border-b-2 border-primary text-primary"
                                            : "text-muted-foreground hover:text-foreground"}`}
                                >
                                    {tab.title}
                                </button>
                            ))}
                        </div>

                        <div className="mt-4 p-4 border rounded-md bg-card">
                            <p className="text-sm text-foreground whitespace-pre-line">
                                <Markdown>
                                    {keyPointList[activeTabIndex]?.detail}
                                </Markdown>
                            </p>
                        </div>
                    </div>
                </>
            )}

            {(!isPending && keyPoint.length <= 0 && !conversationAi) && (
                <div className="relative w-full mx-auto p-6 bg-card rounded-lg shadow" aria-busy={isPending}>
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-2 text-primary">
                            <div className="flex items-center gap-2 justify-center">
                                <Plane className="h-6 w-6 text-primary" />
                                Let's Plan Your Perfect Getaway
                            </div>
                        </h2>
                        <p className="text-muted-foreground mb-6">
                            Please fill out the form below with your desired trip details. <br />The more information you provide, the better travel plan we can create for you!
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
                                {errors.from && (
                                    <p className="mt-1 text-sm text-red-600">{errors.from.message}</p>
                                )}
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium mb-1 text-muted-foreground">To</label>
                                <input
                                    type="text"
                                    {...register("to")}
                                    placeholder="the most beautiful place in Tokyo"
                                    className="w-full rounded-md border border-border p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                {errors.to && (
                                    <p className="mt-1 text-sm text-red-600">{errors.to.message}</p>
                                )}
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
                                {errors.when && (
                                    <p className="mt-1 text-sm text-red-600">{errors.when.message}</p>
                                )}
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium mb-1 text-muted-foreground">Duration</label>
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
                                <label className="block text-sm font-medium mb-1 text-muted-foreground">Holiday Preference</label>
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
                                <label className="block text-sm font-medium mb-1 text-muted-foreground">Number of People</label>
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
                                <label className="block text-sm font-medium mb-1 text-muted-foreground">Transportation</label>
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
                                <label className="block text-sm font-medium mb-1 text-muted-foreground">Estimated Budget</label>
                                <input
                                    type="text"
                                    {...register("estimatedBudget")}
                                    placeholder="ten million rupiah"
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
            {isPending && (
                <div
                    className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm transition-opacity duration-200 pointer-events-none"
                    role="status"
                    aria-live="polite"
                >
                    <div className="flex items-center gap-3 px-4 py-3 rounded-md bg-card shadow">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden="true" />
                        <span className="text-sm text-muted-foreground">Mengirim percakapan...</span>
                    </div>
                </div>
            )
            }
        </>
    )
}