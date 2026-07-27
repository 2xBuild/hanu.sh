"use client";

import { useEffect, useState } from "react";

// Change this value to control the exact full-card reading time.
const FULL_CARD_SECONDS = 4;
const TRANSITION_MS = 720;

const alerts = [
  { title: "Maya", body: "Are we still meeting at seven?" },
  { title: "Arjun", body: "The latest version feels much smoother." },
  { title: "Nila", body: "I sent over the final references." },
  { title: "Sam", body: "That works perfectly for me." },
  { title: "Dev", body: "The preview is ready when you are." },
];

const componentSource = String.raw`"use client";

import { useEffect, useState } from "react";

const FULL_CARD_SECONDS = 4;
const TRANSITION_MS = 720;

const alerts = [
  { title: "Maya", body: "Are we still meeting at seven?" },
  { title: "Arjun", body: "The latest version feels much smoother." },
  { title: "Nila", body: "I sent over the final references." },
  { title: "Sam", body: "That works perfectly for me." },
  { title: "Dev", body: "The preview is ready when you are." },
];

function NotificationCard({ title, body, className = "" }) {
  return (
    <article className={"notification-card " + className}>
      <div className="notification-icon" aria-hidden>
        <svg viewBox="0 0 24 24" focusable="false">
          <path d="M5.25 8.85c0-2.38 1.92-4.3 4.3-4.3h4.9c2.38 0 4.3 1.92 4.3 4.3v2.9c0 2.38-1.92 4.3-4.3 4.3h-2.86l-3.74 3.04c-.45.37-1.11.04-1.11-.54v-2.73a4.3 4.3 0 0 1-1.49-3.25V8.85Z" />
        </svg>
      </div>

      <div className="notification-copy">
        <h2>{title}</h2>
        <p>{body}</p>
      </div>
    </article>
  );
}

export function IosNotificationQueue() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const activeAlert = alerts[activeIndex];
  const nextIndex = (activeIndex + 1) % alerts.length;
  const nextAlert = alerts[nextIndex];

  useEffect(() => {
    const timeout = window.setTimeout(
      () => {
        if (!isTransitioning) {
          setIsTransitioning(true);
        } else {
          setActiveIndex((currentIndex) => (currentIndex + 1) % alerts.length);
          setIsTransitioning(false);
        }
      },
      isTransitioning ? TRANSITION_MS : FULL_CARD_SECONDS * 1000,
    );

    return () => window.clearTimeout(timeout);
  }, [isTransitioning]);

  return (
    <div className={"notification-stage " + (isTransitioning ? "notification-stage--running" : "")}>
      <div className="notification-stack" aria-hidden>
        <span />
        <span />
        <span />
      </div>

      <NotificationCard
        title={activeAlert.title}
        body={activeAlert.body}
        className={isTransitioning ? "notification-card--active notification-card--exiting" : "notification-card--active"}
      />

      <NotificationCard
        title={nextAlert.title}
        body={nextAlert.body}
        className={isTransitioning ? "notification-card--incoming" : "notification-card--incoming-ready"}
      />
    </div>
  );
}`;

function NotificationCard({
  title,
  body,
  className = "",
  announce = false,
}: {
  title: string;
  body: string;
  className?: string;
  announce?: boolean;
}) {
  return (
    <article
      className={`notification-card ${className}`}
      aria-live={announce ? "polite" : undefined}
      aria-hidden={announce ? undefined : true}
    >
      <div className="notification-icon" aria-hidden>
        <svg viewBox="0 0 24 24" focusable="false">
          <path d="M5.25 8.85c0-2.38 1.92-4.3 4.3-4.3h4.9c2.38 0 4.3 1.92 4.3 4.3v2.9c0 2.38-1.92 4.3-4.3 4.3h-2.86l-3.74 3.04c-.45.37-1.11.04-1.11-.54v-2.73a4.3 4.3 0 0 1-1.49-3.25V8.85Z" />
        </svg>
      </div>

      <div className="notification-copy">
        <h2>{title}</h2>
        <p>{body}</p>
      </div>
    </article>
  );
}

export default function UiPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const activeAlert = alerts[activeIndex];
  const nextIndex = (activeIndex + 1) % alerts.length;
  const nextAlert = alerts[nextIndex];
  const visibleCards = [
    {
      index: activeIndex,
      alert: activeAlert,
      className: isTransitioning
        ? "notification-card--active notification-card--exiting"
        : "notification-card--active",
      announce: true,
    },
    {
      index: nextIndex,
      alert: nextAlert,
      className: isTransitioning
        ? "notification-card--incoming"
        : "notification-card--incoming-ready",
      announce: false,
    },
  ];

  useEffect(() => {
    let timeout: number | undefined;

    if (!isTransitioning) {
      timeout = window.setTimeout(
        () => setIsTransitioning(true),
        FULL_CARD_SECONDS * 1000,
      );
    } else {
      timeout = window.setTimeout(() => {
        setActiveIndex((currentIndex) => (currentIndex + 1) % alerts.length);
        setIsTransitioning(false);
      }, TRANSITION_MS);
    }

    return () => {
      if (timeout !== undefined) window.clearTimeout(timeout);
    };
  }, [isTransitioning]);

  async function copyComponent() {
    await navigator.clipboard.writeText(componentSource);
    setHasCopied(true);
    window.setTimeout(() => setHasCopied(false), 1400);
  }

  return (
    <main className="notification-demo">
      <div className="notification-showcase">
        <section
          className="notification-widget"
          aria-label="Animated iOS-style notification queue"
        >
          <div className="notification-widget__wallpaper" aria-hidden />

          <div
            className={`notification-stage ${
              isTransitioning ? "notification-stage--running" : ""
            }`}
          >
            <div className="notification-stack" aria-hidden>
              <span />
              <span />
              <span />
            </div>

            {visibleCards.map(({ index, alert, className, announce }) => (
              <NotificationCard
                key={`notification-${index}`}
                title={alert.title}
                body={alert.body}
                className={className}
                announce={announce}
              />
            ))}
          </div>
        </section>

        <section className="notification-code" aria-label="Component code">
          <header>
            <span>ios-notification-widget.tsx</span>
            <button
              type="button"
              className="notification-copy-button"
              aria-label={hasCopied ? "Copied" : "Copy code"}
              title={hasCopied ? "Copied" : "Copy code"}
              onClick={copyComponent}
            >
              {hasCopied ? (
                <svg viewBox="0 0 24 24" focusable="false">
                  <path d="M9.55 16.58a1 1 0 0 1-.7-.29l-3.1-3.1a1 1 0 1 1 1.42-1.42l2.38 2.38 7.28-7.28a1 1 0 0 1 1.42 1.42l-7.99 8a1 1 0 0 1-.71.29Z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" focusable="false">
                  <path d="M8 7.5A2.5 2.5 0 0 1 10.5 5h6A2.5 2.5 0 0 1 19 7.5v6A2.5 2.5 0 0 1 16.5 16h-6A2.5 2.5 0 0 1 8 13.5v-6Zm2.5-.5A.5.5 0 0 0 10 7.5v6a.5.5 0 0 0 .5.5h6a.5.5 0 0 0 .5-.5v-6a.5.5 0 0 0-.5-.5h-6ZM5 10.5A2.5 2.5 0 0 1 7.5 8a1 1 0 1 1 0 2A.5.5 0 0 0 7 10.5v6a.5.5 0 0 0 .5.5h6a.5.5 0 0 0 .5-.5 1 1 0 1 1 2 0 2.5 2.5 0 0 1-2.5 2.5h-6A2.5 2.5 0 0 1 5 16.5v-6Z" />
                </svg>
              )}
            </button>
          </header>
          <pre>
            <code>{componentSource}</code>
          </pre>
        </section>
      </div>
    </main>
  );
}
