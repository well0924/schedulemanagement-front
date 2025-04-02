'use client';

import { Schedule } from "@/app/interfaces/calendar/calendarModel";
import { useState } from "react";
import TodaySchedule from "./calendar/TodaySchedules";
import AddScheduleButton from "./calendar/AddScheduleButton";
import ScheduleCalendar from "./calendar/MainCalendar";
import { mapRequestToSchedule } from "../utile/mapRequestToSchedule";

interface Props {
    initialSchedules: Schedule[];
}

export default function ClientHome({ initialSchedules }: Props) {
    const [schedules, setSchedules] = useState<Schedule[]>(initialSchedules);

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">📅 내 일정</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <TodaySchedule schedules={schedules} />
                </div>
                <div>
                    <ScheduleCalendar />
                </div>
            </div>

            <AddScheduleButton
                onScheduleAdd={(newScheduleRequest) => {
                    const converted = mapRequestToSchedule(newScheduleRequest);
                    setSchedules(prev => [...prev, converted]);
                }}
            />
        </div>
    );
}
