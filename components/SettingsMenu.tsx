"use client";

import { useEffect, useState } from "react";

const vibrationKey = "vibrationEnabled";

function readVibrationSetting() {
  try {
    const savedValue = window.localStorage.getItem(vibrationKey);

    return savedValue === null ? true : savedValue === "true";
  } catch {
    return true;
  }
}

export function SettingsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  useEffect(() => {
    // localStorage is only available after this client component mounts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVibrationEnabled(readVibrationSetting());
  }, []);

  function handleToggleVibration() {
    setVibrationEnabled((currentValue) => {
      const nextValue = !currentValue;

      try {
        window.localStorage.setItem(vibrationKey, String(nextValue));
      } catch {
        // If localStorage is unavailable, keep the in-memory toggle responsive.
      }

      return nextValue;
    });
  }

  return (
    <>
      <button
        aria-label="Open settings"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#151515] text-lg font-semibold text-[#f4f4f2] shadow-[0_14px_35px_rgba(0,0,0,0.35)]"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        ...
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/45 px-4 pb-4 backdrop-blur-sm">
          <button
            aria-label="Close settings"
            className="absolute inset-0 cursor-default"
            onClick={() => setIsOpen(false)}
            type="button"
          />
          <section className="relative w-full max-w-md rounded-[2rem] border border-white/10 bg-[#111111] p-5 shadow-[0_-24px_70px_rgba(0,0,0,0.5)]">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#f4f4f2]">
                Settings
              </h2>
              <button
                className="rounded-full px-3 py-2 text-sm font-semibold text-[#bdbdb8] transition hover:bg-white/5 hover:text-[#f4f4f2]"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                Close
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-[1.5rem] border border-white/8 bg-[#0f0f0f] p-4">
                <div>
                  <p className="text-sm font-semibold text-[#f4f4f2]">
                    Vibration
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#9a9a95]">
                    Short cue when the breathing phase changes.
                  </p>
                </div>
                <button
                  aria-label={`Turn vibration ${
                    vibrationEnabled ? "off" : "on"
                  }`}
                  aria-pressed={vibrationEnabled}
                  className={`flex h-8 w-14 items-center rounded-full p-1 transition ${
                    vibrationEnabled ? "bg-[#f2f2ee]" : "bg-[#2a2a2a]"
                  }`}
                  onClick={handleToggleVibration}
                  type="button"
                >
                  <span
                    className={`h-6 w-6 rounded-full bg-[#050505] transition ${
                      vibrationEnabled ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <p className="rounded-[1.5rem] bg-[#0f0f0f] p-4 text-sm leading-6 text-[#9a9a95]">
                breathe. helps you slow down, complete guided breathing
                sessions, and reflect daily.
              </p>

              <p className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-[#d1d1cc]">
                Breathe gently. Stop if you feel uncomfortable.
              </p>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
