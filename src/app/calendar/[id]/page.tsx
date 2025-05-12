import ScheduleDetailModal from "@/app/components/calendar/ScheduleDetailModal";
import { ScheduleById } from "@/app/utile/api/ScheduleApi";
import { ScheduleResponse } from "@/app/utile/interfaces/calendar/calendarModel";


interface Props {
    scheduleId: number;
    onClose: () => void;
}
  
export default async function ScheduleDetailServer({ scheduleId, onClose }: Props) {
    const schedule: ScheduleResponse = await ScheduleById(scheduleId);
    return <ScheduleDetailModal schedule={schedule} onClose={onClose} />;
}