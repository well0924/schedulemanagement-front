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
                className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-blue-500 text-white text-2xl shadow-lg"
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