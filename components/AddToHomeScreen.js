"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

import { useTranslations } from "@/lib/i18n/use-translations";
import { useStatisticsStore } from "@/lib/stores/statistics-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { m } from "framer-motion";

const isIphone = () => {
  if (typeof window !== "undefined") {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone/.test(userAgent);
  } else {
    return false;
  }
};

const AddToHomeScreen = ({ modalClosed }) => {
  const { data: statistics } = useStatisticsStore();
  const { currentModal, installPopupVisible, setInstallPopupVisible } = useUIStore();
  const translations = useTranslations();

  const hasStatistics = statistics && Object.keys(statistics).length > 0;

  return isIphone() &&
    hasStatistics &&
    !currentModal &&
    !window?.navigator?.standalone &&
    installPopupVisible ? (
    <div className="hide-in-standalone">
      <m.div
        initial={{ y: 10 }}
        animate={{ y: 0 }}
        className={cn(
          "fixed z-[99999] max-w-[380px] mx-auto",
          "bottom-5 left-0 right-0"
        )}
      >
        <div
          className={cn(
            "flex bg-white items-center justify-around",
            "flex-row rounded-[5px] p-2.5 mx-5",
            "shadow-[0px_0px_40px_0px_rgba(0,0,0,0.2)]",
            "after:content-[''] after:absolute after:bottom-[-10px]",
            "after:border-t-[10px] after:border-t-white",
            "after:border-l-[10px] after:border-l-transparent",
            "after:border-r-[10px] after:border-r-transparent"
          )}
        >
          <div className="text-center text-[#202020]">
            <div className="text-sm">
              Zet {translations.title} op je beginscherm
            </div>
            <div className="text-sm">
              Tap
              <span className="mx-2.5 mt-2.5 inline-block">
                <Image
                  src="/icons/iosshare.svg"
                  alt="Share"
                  width={20}
                  height={20}
                />
              </span>
              en kies dan &ldquo;Zet op beginscherm&rdquo;
            </div>
          </div>
          <div onClick={() => setInstallPopupVisible(false)} className="cursor-pointer">
            <Image src="/icons/close.svg" alt="Sluiten" width={20} height={20} />
          </div>
        </div>
      </m.div>
    </div>
  ) : null;
};

export default AddToHomeScreen;
