"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type FormEvent } from "react";
import { Bot, LoaderCircle, MessageCircle, Send, X } from "lucide-react";
import TypewriterText from "./TypewriterText";
import { useLanguage } from "@/app/i18n/LanguageContext";
import { useChat } from "@ai-sdk/react";
import { createChatTransport, messageText } from "@/app/lib/chatbot/transport";

import { chatLimits, toDisplayErrorCode, type ChatDisplayErrorCode } from "@/app/lib/chatbot/contracts";

const INVITATION_DELAY_MS = 2500;
const INVITATION_VISIBLE_MS = 6000;
const INVITATION_EXIT_MS = 250;

export default function Chatbot() {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [invitationState, setInvitationState] = useState<"waiting" | "typing" | "visible" | "leaving" | "dismissed">("waiting");
  const [isInvitationPaused, setInvitationPaused] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<ChatDisplayErrorCode | null>(null);
  const [transport] = useState(createChatTransport);
  const activeRequest = useRef<{ succeeded: boolean } | null>(null);
  const { messages: chatMessages, setMessages, sendMessage, stop, clearError, status } = useChat({
    transport,
    onError(failure) {
      setError(toDisplayErrorCode(failure.message));
    },
    onFinish({ isAbort, isError, finishReason }) {
      if (!isAbort && !isError && finishReason !== "stop") setError("invalid_response");
      if (activeRequest.current) {
        activeRequest.current.succeeded = !isAbort && !isError && finishReason === "stop";
      }
    },
  });
  const messages = useMemo(
    () => chatMessages.map((message) => ({ ...message, content: messageText(message) })),
    [chatMessages],
  );
  const isLoading = status === "submitted" || status === "streaming";
  const id = useId();
  const panelId = `${id}-panel`;
  const titleId = `${id}-title`;
  const inputId = `${id}-input`;
  const invitationTitleId = `${id}-invitation-title`;
  const invitationTextId = `${id}-invitation-text`;
  const showInvitation = !isOpen && (invitationState === "typing" || invitationState === "visible" || invitationState === "leaving");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messageListRef = useRef<HTMLDivElement>(null);

  const startInvitationTyping = useCallback(() => {
    setInvitationState((current) => current === "visible" ? "typing" : current);
  }, []);
  const completeInvitationTyping = useCallback(() => {
    setInvitationState((current) => current === "typing" ? "visible" : current);
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setInvitationState((current) => current === "waiting" ? "typing" : current);
    }, INVITATION_DELAY_MS);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (invitationState === "visible" && !isInvitationPaused) {
      const timeout = window.setTimeout(() => setInvitationState("leaving"), INVITATION_VISIBLE_MS);
      return () => window.clearTimeout(timeout);
    }
    if (invitationState === "leaving") {
      const timeout = window.setTimeout(() => setInvitationState("dismissed"), INVITATION_EXIT_MS);
      return () => window.clearTimeout(timeout);
    }
  }, [invitationState, isInvitationPaused]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    const list = messageListRef.current;
    if (isOpen && list) list.scrollTop = list.scrollHeight;
  }, [messages, isOpen, isLoading, error]);

  function dismissInvitation() {
    setInvitationState("leaving");
    triggerRef.current?.focus();
  }

  function openChat() {
    setInvitationState("dismissed");
    setIsOpen(true);
  }

  function closeChat() {
    void stop();
    setIsOpen(false);
    triggerRef.current?.focus();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = draft.trim();
    // A ref bloqueia outro envio imediatamente, antes da próxima renderização.
    if (!content || activeRequest.current) return;
    const previousMessages = chatMessages;
    const pending = { succeeded: false };
    activeRequest.current = pending;
    let timedOut = false;
    const timeout = window.setTimeout(() => {
      timedOut = true;
      void stop();
    }, 55000);

    setDraft("");
    setError(null);
    clearError();
    inputRef.current?.focus();

    try {
      await sendMessage({ text: content }, { body: { language } });
    } catch {
      setError("unavailable");
    } finally {
      window.clearTimeout(timeout);
      // Só respostas concluídas podem compor a próxima pergunta.
      if (!pending.succeeded) {
        setMessages(previousMessages);
        setDraft(content);
      }
      if (timedOut) setError("timeout");
      activeRequest.current = null;
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 text-white sm:bottom-6 sm:right-6">
      {showInvitation && (
        <aside
          aria-labelledby={invitationTitleId}
          data-state={invitationState}
          inert={invitationState === "leaving"}
          onMouseEnter={() => setInvitationPaused(true)}
          onMouseLeave={(event) => setInvitationPaused(event.currentTarget.contains(document.activeElement))}
          onFocusCapture={() => setInvitationPaused(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setInvitationPaused(event.currentTarget.matches(":hover"));
            }
          }}
          className="chatbot-invitation absolute bottom-16 right-0 w-72 max-w-[calc(100vw-3rem)] rounded-2xl rounded-br-md border border-emerald-400/30 bg-gray-950 p-5 shadow-xl shadow-black/30"
        >
          <span aria-hidden="true" className="absolute -bottom-1.5 right-8 h-3 w-3 rotate-45 border-b border-r border-emerald-400/30 bg-gray-950" />
          <button
            type="button"
            onClick={dismissInvitation}
            aria-label={t.chatbot.invitation.dismiss}
            className="absolute right-2 top-2 rounded-lg p-2.5 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
          >
            <X size={16} aria-hidden="true" />
          </button>
          <div className="mb-3 flex items-center gap-2 text-emerald-400">
            <Bot size={18} aria-hidden="true" />
            <span className="text-xs font-bold tracking-wide">{t.chatbot.title}</span>
          </div>
          <h2 id={invitationTitleId} className="pr-2 text-sm font-bold leading-relaxed text-white">
            {t.chatbot.invitation.title}
          </h2>
          <p id={invitationTextId} className="mt-2 text-xs leading-relaxed text-gray-300" role="status">
            <TypewriterText
              key={t.chatbot.invitation.description}
              text={t.chatbot.invitation.description}
              onStart={startInvitationTyping}
              onComplete={completeInvitationTyping}
            />
          </p>
          {/* <button
            type="button"
            onClick={openChat}
            className="mt-4 flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-emerald-400/10 px-3 py-2 text-xs font-bold text-emerald-300 transition-colors hover:bg-emerald-400/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
          >
            <MessageCircle size={15} aria-hidden="true" />
            {t.chatbot.invitation.action}
          </button> */}
        </aside>
      )}
      {isOpen && (
        <section
          id={panelId}
          role="dialog"
          aria-labelledby={titleId}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.stopPropagation();
              closeChat();
            }
          }}
          className="absolute bottom-16 right-0 flex h-[50rem] max-h-[calc(100dvh-10rem)] w-[calc(100vw-2rem)] max-w-md flex-col overflow-hidden rounded-2xl border border-gray-700 bg-gray-950 shadow-2xl shadow-black/50"
        >
          <header className="flex shrink-0 items-center gap-3 border-b border-gray-800 bg-gray-900 p-4">
            <div className="rounded-xl bg-emerald-400/10 p-2 text-emerald-400">
              <Bot size={22} aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 id={titleId} className="font-bold text-emerald-400">{t.chatbot.title}</h2>
              <p className="text-xs text-gray-400">{t.chatbot.subtitle}</p>
            </div>
            <button
                type="button"
                onClick={closeChat}
                aria-label={t.chatbot.close}
                className="rounded-lg p-2 text-gray-300 hover:bg-gray-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </header>

          <div
              ref={messageListRef}
              role="log"
              aria-label={t.chatbot.conversation}
              aria-live="polite"
              className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4"
          >
            <p className="rounded-2xl rounded-tl-sm border border-gray-800 bg-gray-900 p-4 text-xs leading-relaxed text-gray-200">
              {t.chatbot.welcome}
            </p>
            {messages.length === 0 && !error && (
              <div role="group" aria-label={t.chatbot.suggestionsTitle} className="space-y-2">
                <p className="text-xs text-gray-400">{t.chatbot.suggestionsTitle}</p>
                <div className="grid grid-cols-2 gap-2">
                  {t.chatbot.suggestions.map((suggestion) => (
                    <button
                        key={suggestion.label}
                        type="button"
                        disabled={isLoading}
                        onClick={() => {
                          setDraft(suggestion.question);
                          inputRef.current?.focus();
                        }}
                        className="rounded-xl border border-gray-700 px-3 py-2 text-left text-xs text-gray-200 transition-colors hover:border-emerald-400 hover:text-emerald-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 disabled:opacity-50"
                    >
                      {suggestion.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <p className={`max-w-[90%] whitespace-pre-wrap break-words rounded-2xl p-3 text-xs leading-relaxed ${message.role === "user"
                  ? "rounded-tr-sm bg-emerald-400/15 text-emerald-100"
                  : "rounded-tl-sm border border-gray-800 bg-gray-900 text-gray-200"}`}>
                  <span className="sr-only">{message.role === "user" ? t.chatbot.you : t.chatbot.title}: </span>
                  {message.content}
                </p>
              </div>
            ))}
            {isLoading && messages.at(-1)?.role !== "assistant" && (
              <p className="flex items-center gap-2 text-sm text-gray-400">
                <LoaderCircle size={16} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
                {t.chatbot.loading}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="shrink-0 space-y-3 border-t border-gray-800 p-4">
            {error && (
              <p role="alert" className="text-sm text-rose-300">
                {t.chatbot.errors[error]}{" "}
                <a href={`/${language}/contact`} className="underline underline-offset-2">{t.chatbot.contact}</a>
              </p>
            )}
            <label htmlFor={inputId} className="sr-only">{t.chatbot.inputLabel}</label>
            <textarea
                ref={inputRef}
                id={inputId}
                rows={2}
                maxLength={chatLimits.maxMessageCharacters}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                readOnly={isLoading}
                placeholder={t.chatbot.placeholder}
                className="block w-full resize-none rounded-xl border border-gray-700 bg-gray-900 p-3 text-sm text-white placeholder:text-gray-500 focus-visible:outline-2 focus-visible:outline-emerald-400"
            />
            <button
                type="submit"
                disabled={isLoading || !draft.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-2 text-sm font-bold text-gray-950 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={16} aria-hidden="true" />
              {isLoading ? t.chatbot.loading : t.chatbot.send}
            </button>
          </form>
        </section>
      )}

      <button
          ref={triggerRef}
          type="button"
          onClick={() => isOpen ? closeChat() : openChat()}
          aria-label={isOpen ? t.chatbot.close : t.chatbot.open}
          aria-expanded={isOpen}
          aria-describedby={invitationState === "typing" || invitationState === "visible" ? invitationTextId : undefined}
          aria-controls={isOpen ? panelId : undefined}
          aria-haspopup="dialog"
          className="chatbot-launcher relative flex h-12 items-center gap-2 rounded-full bg-emerald-400 px-5 font-bold text-gray-950 shadow-lg shadow-emerald-950/30 transition-[background-color,box-shadow,translate] duration-200 hover:-translate-y-0.5 hover:bg-emerald-300 hover:shadow-emerald-400/20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-400 motion-reduce:hover:translate-y-0 motion-reduce:transition-none"
      >
        {showInvitation && (
          <span aria-hidden="true" className="chatbot-launcher-ring pointer-events-none absolute inset-0 rounded-full border-2 border-emerald-300/60" />
        )}
        <MessageCircle size={22} aria-hidden="true" className={showInvitation ? "chatbot-launcher-icon" : undefined} />
        {t.chatbot.title}
      </button>
    </div>
  );
}
