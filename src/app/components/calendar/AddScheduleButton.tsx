'use client';

import { useState } from "react";
import AddScheduleModal from "./AddScheduleModal";
import { ScheduleRequest } from "@/app/utile/interfaces/calendar/calendarModel";

interface Props {
    onScheduleAdd: (newSchedule: ScheduleRequest) => void;
}

export default function AddScheduleButton({ onScheduleAdd }: Props) {

    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                className={`fixed bottom-6 right-6 
                    w-12 h-12 sm:w-14 sm:h-14 
                    rounded-full 
                    bg-blue-500 text-white text-2xl 
                    shadow-lg 
                    transform transition-transform duration-200 ease-in-out
                    hover:scale-110 active:scale-95
                    z-50`}
                onClick={() => setIsOpen(true)}
            >
                +
            </button>
            <AddScheduleModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onScheduleAdd={(newSchedule) => {
                    onScheduleAdd(newSchedule);
                    setIsOpen(false);          
                }}
            />
        </>
    );
}